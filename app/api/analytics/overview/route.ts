import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/analytics/overview
 * Get analytics overview for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      );
    }

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get appointment statistics
    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      appointments,
    ] = await Promise.all([
      // Total appointments
      prisma.appointment.count({
        where: {
          providerId,
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
      }),

      // Completed appointments
      prisma.appointment.count({
        where: {
          providerId,
          status: 'COMPLETED',
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
      }),

      // Cancelled appointments
      prisma.appointment.count({
        where: {
          providerId,
          status: 'CANCELLED',
          ...(Object.keys(dateFilter).length > 0 ? { cancelledAt: dateFilter } : {}),
        },
      }),

      // Total revenue
      prisma.appointment.aggregate({
        where: {
          providerId,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
        _sum: {
          amount: true,
        },
      }),

      // Recent appointments for chart
      prisma.appointment.findMany({
        where: {
          providerId,
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
        select: {
          date: true,
          amount: true,
          status: true,
        },
        orderBy: {
          date: 'asc',
        },
      }),
    ]);

    // Get top services
    const topServices = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        providerId,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get service details
    const serviceIds = topServices.map(s => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topServicesWithNames = topServices.map(ts => {
      const service = services.find(s => s.id === ts.serviceId);
      return {
        name: service?.name || 'Unknown',
        count: ts._count.id,
        revenue: ts._sum.amount || 0,
      };
    });

    // Calculate daily revenue for chart
    const dailyRevenue = appointments.reduce((acc, apt) => {
      const dateKey = apt.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, revenue: 0, count: 0 };
      }
      if (apt.status === 'COMPLETED') {
        acc[dateKey].revenue += apt.amount;
      }
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; count: number }>);

    const revenueChart = Object.values(dailyRevenue).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Calculate metrics
    const averageRevenue = completedAppointments > 0
      ? (totalRevenue._sum.amount || 0) / completedAppointments
      : 0;

    const cancellationRate = totalAppointments > 0
      ? (cancelledAppointments / totalAppointments) * 100
      : 0;

    const completionRate = totalAppointments > 0
      ? (completedAppointments / totalAppointments) * 100
      : 0;

    return NextResponse.json({
      overview: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageRevenue,
        cancellationRate,
        completionRate,
      },
      topServices: topServicesWithNames,
      revenueChart,
    });
  } catch (error: any) {
    console.error('[API] Failed to fetch analytics:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
