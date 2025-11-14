import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/analytics - Get provider analytics data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const providerId = user.providerProfile.id;

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30'; // Default 30 days
    const range = parseInt(rangeParam);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);

    // 1. Revenue Analytics
    const revenueData = await prisma.appointment.groupBy({
      by: ['date'],
      where: {
        providerId,
        paymentStatus: 'PAID',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 2. Total Revenue
    const totalRevenue = await prisma.appointment.aggregate({
      where: {
        providerId,
        paymentStatus: 'PAID',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
        tipAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // 3. Service Performance
    const serviceStats = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        providerId,
        paymentStatus: 'PAID',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get service details
    const serviceIds = serviceStats.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    const servicePerformance = serviceStats.map((stat) => {
      const service = services.find((s) => s.id === stat.serviceId);
      return {
        serviceName: service?.name || 'Unknown',
        bookings: stat._count.id,
        revenue: stat._sum.amount || 0,
      };
    });

    // 4. Staff Performance
    const staffStats = await prisma.appointment.groupBy({
      by: ['assignedToId'],
      where: {
        providerId,
        paymentStatus: 'PAID',
        assignedToId: {
          not: null,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
        tipAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Get staff details
    const staffIds = staffStats
      .map((s) => s.assignedToId)
      .filter((id): id is string => id !== null);

    const staff = await prisma.staff.findMany({
      where: {
        id: {
          in: staffIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const staffPerformance = staffStats.map((stat) => {
      const staffMember = staff.find((s) => s.id === stat.assignedToId);
      return {
        staffName: staffMember?.name || 'Unknown',
        bookings: stat._count.id,
        revenue: stat._sum.amount || 0,
        tips: stat._sum.tipAmount || 0,
        totalEarnings: (stat._sum.amount || 0) + (stat._sum.tipAmount || 0),
      };
    });

    // 5. Appointment Status Distribution
    const statusDistribution = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        providerId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // 6. Customer Retention
    const repeatCustomers = await prisma.appointment.groupBy({
      by: ['customerId'],
      where: {
        providerId,
        paymentStatus: 'PAID',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const totalCustomers = await prisma.appointment.findMany({
      where: {
        providerId,
        paymentStatus: 'PAID',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      distinct: ['customerId'],
      select: {
        customerId: true,
      },
    });

    const retentionRate = totalCustomers.length > 0
      ? (repeatCustomers.length / totalCustomers.length) * 100
      : 0;

    // 7. Average Booking Value
    const avgBookingValue = totalRevenue._count.id > 0
      ? (totalRevenue._sum.amount || 0) / totalRevenue._count.id
      : 0;

    // 8. Reviews Summary
    const reviewStats = await prisma.review.aggregate({
      where: {
        providerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    // 9. Peak Hours Analysis
    const appointmentsByTime = await prisma.appointment.findMany({
      where: {
        providerId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED'],
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startTime: true,
      },
    });

    const hourDistribution: { [key: string]: number } = {};
    appointmentsByTime.forEach((apt) => {
      const hour = apt.startTime.split(':')[0];
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        bookings: count,
      }));

    // 10. Cancellation Rate
    const cancelledCount = await prisma.appointment.count({
      where: {
        providerId,
        status: 'CANCELLED',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalAppointments = await prisma.appointment.count({
      where: {
        providerId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const cancellationRate = totalAppointments > 0
      ? (cancelledCount / totalAppointments) * 100
      : 0;

    // Return comprehensive analytics
    return NextResponse.json({
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalTips: totalRevenue._sum.tipAmount || 0,
        totalBookings: totalRevenue._count.id,
        avgBookingValue,
        retentionRate: Math.round(retentionRate * 10) / 10,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        avgRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count.id,
      },
      revenue: {
        daily: revenueData.map((d) => ({
          date: d.date.toISOString().split('T')[0],
          amount: d._sum.amount || 0,
          bookings: d._count.id,
        })),
      },
      services: servicePerformance,
      staff: staffPerformance,
      status: statusDistribution.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      peakHours,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: range,
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
