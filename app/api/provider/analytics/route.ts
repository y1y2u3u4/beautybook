import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Check if database is available
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Mock analytics data for demo mode
const mockAnalytics = {
  overview: {
    monthlyRevenue: 4280,
    revenueChange: 23,
    totalAppointments: 24,
    appointmentsChange: 12,
    totalCustomers: 156,
    customersChange: 8,
    averageRating: 4.9,
    ratingChange: 0.2,
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 3200 },
    { month: 'Feb', revenue: 3800 },
    { month: 'Mar', revenue: 4200 },
    { month: 'Apr', revenue: 3900 },
    { month: 'May', revenue: 4500 },
    { month: 'Jun', revenue: 5100 },
  ],
  topServices: [
    { name: 'Hydrating Facial', bookings: 45, revenue: 6750 },
    { name: 'Anti-Aging Treatment', bookings: 28, revenue: 8400 },
    { name: 'Chemical Peel', bookings: 32, revenue: 8000 },
  ],
  bookingTrends: {
    peakHours: '2PM - 5PM',
    busiestDay: 'Saturday',
    avgBookingValue: 178,
    cancellationRate: 5.2,
  },
  customerInsights: {
    newCustomers: 12,
    newCustomersChange: 25,
    returningRate: 78,
    avgVisitsPerCustomer: 6.5,
    customerSatisfaction: 96,
  },
};

/**
 * GET /api/provider/analytics
 * Get analytics data for the current provider
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return NextResponse.json({
        analytics: mockAnalytics,
        source: 'mock',
      });
    }

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const providerId = user.providerProfile.id;

    // Get date ranges
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      where: { providerId },
      include: {
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        customer: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate this month's stats
    const thisMonthAppointments = appointments.filter(
      apt => apt.date >= thisMonthStart && apt.status === 'COMPLETED'
    );
    const thisMonthRevenue = thisMonthAppointments.reduce((sum, apt) => sum + apt.amount, 0);

    // Calculate last month's stats
    const lastMonthAppointments = appointments.filter(
      apt => apt.date >= lastMonthStart && apt.date <= lastMonthEnd && apt.status === 'COMPLETED'
    );
    const lastMonthRevenue = lastMonthAppointments.reduce((sum, apt) => sum + apt.amount, 0);

    // Calculate changes
    const revenueChange = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    const appointmentsChange = lastMonthAppointments.length > 0
      ? Math.round(((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100)
      : 0;

    // Get unique customers
    const uniqueCustomerIds = new Set(appointments.map(apt => apt.customerId));
    const totalCustomers = uniqueCustomerIds.size;

    // New customers this month
    const newCustomersThisMonth = new Set(
      thisMonthAppointments
        .filter(apt => apt.customer.createdAt >= thisMonthStart)
        .map(apt => apt.customerId)
    ).size;

    const newCustomersLastMonth = new Set(
      lastMonthAppointments
        .filter(apt => apt.customer.createdAt >= lastMonthStart && apt.customer.createdAt <= lastMonthEnd)
        .map(apt => apt.customerId)
    ).size;

    const customersChange = newCustomersLastMonth > 0
      ? Math.round(((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100)
      : 0;

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { providerId },
    });
    const averageRating = reviews.length > 0
      ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Calculate monthly revenue for last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleString('en-US', { month: 'short' });

      const revenue = appointments
        .filter(apt =>
          apt.date >= monthStart &&
          apt.date <= monthEnd &&
          apt.status === 'COMPLETED'
        )
        .reduce((sum, apt) => sum + apt.amount, 0);

      monthlyRevenue.push({ month: monthName, revenue });
    }

    // Top services
    const serviceStats = new Map<string, { name: string; bookings: number; revenue: number }>();
    for (const apt of appointments.filter(a => a.status === 'COMPLETED')) {
      const serviceName = apt.service.name;
      const existing = serviceStats.get(serviceName);
      if (existing) {
        existing.bookings++;
        existing.revenue += apt.amount;
      } else {
        serviceStats.set(serviceName, {
          name: serviceName,
          bookings: 1,
          revenue: apt.amount,
        });
      }
    }
    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Booking trends
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED');
    const cancellationRate = appointments.length > 0
      ? +((cancelledAppointments.length / appointments.length) * 100).toFixed(1)
      : 0;

    // Calculate peak hours
    const hourCounts = new Map<number, number>();
    for (const apt of completedAppointments) {
      const hour = parseInt(apt.startTime.split(':')[0]);
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
    let peakHour = 14; // Default to 2 PM
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    });
    const peakHours = `${peakHour > 12 ? peakHour - 12 : peakHour}${peakHour >= 12 ? 'PM' : 'AM'} - ${(peakHour + 3) > 12 ? (peakHour + 3) - 12 : (peakHour + 3)}${(peakHour + 3) >= 12 ? 'PM' : 'AM'}`;

    // Calculate busiest day
    const dayCounts = new Map<number, number>();
    for (const apt of completedAppointments) {
      const day = apt.date.getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let busiestDay = 'Saturday';
    let maxDayCount = 0;
    dayCounts.forEach((count, day) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        busiestDay = days[day];
      }
    });

    // Average booking value
    const avgBookingValue = completedAppointments.length > 0
      ? Math.round(completedAppointments.reduce((sum, apt) => sum + apt.amount, 0) / completedAppointments.length)
      : 0;

    // Customer insights
    const customerAppointmentCounts = new Map<string, number>();
    for (const apt of appointments) {
      customerAppointmentCounts.set(
        apt.customerId,
        (customerAppointmentCounts.get(apt.customerId) || 0) + 1
      );
    }
    const returningCustomers = Array.from(customerAppointmentCounts.values()).filter(c => c > 1).length;
    const returningRate = totalCustomers > 0
      ? Math.round((returningCustomers / totalCustomers) * 100)
      : 0;

    const avgVisitsPerCustomer = totalCustomers > 0
      ? +(appointments.length / totalCustomers).toFixed(1)
      : 0;

    // Customer satisfaction (based on reviews)
    const satisfiedReviews = reviews.filter(r => r.rating >= 4).length;
    const customerSatisfaction = reviews.length > 0
      ? Math.round((satisfiedReviews / reviews.length) * 100)
      : 0;

    const analytics = {
      overview: {
        monthlyRevenue: thisMonthRevenue,
        revenueChange,
        totalAppointments: thisMonthAppointments.length,
        appointmentsChange,
        totalCustomers,
        customersChange,
        averageRating,
        ratingChange: 0, // Would need historical data
      },
      monthlyRevenue,
      topServices,
      bookingTrends: {
        peakHours,
        busiestDay,
        avgBookingValue,
        cancellationRate,
      },
      customerInsights: {
        newCustomers: newCustomersThisMonth,
        newCustomersChange: customersChange,
        returningRate,
        avgVisitsPerCustomer,
        customerSatisfaction,
      },
    };

    return NextResponse.json({
      analytics,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get provider analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
