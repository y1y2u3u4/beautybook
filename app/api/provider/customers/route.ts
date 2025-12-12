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

// Mock customers data for demo mode
const mockCustomers = [
  {
    id: 'mock_customer_1',
    name: 'Jessica Smith',
    email: 'jessica.smith@example.com',
    phone: '(555) 123-4567',
    totalAppointments: 8,
    totalSpent: 1200,
    lastVisit: '2024-01-15',
    averageRating: 5.0,
    joinedDate: '2023-06-15',
    imageUrl: null,
  },
  {
    id: 'mock_customer_2',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '(555) 234-5678',
    totalAppointments: 12,
    totalSpent: 2400,
    lastVisit: '2024-01-18',
    averageRating: 5.0,
    joinedDate: '2023-03-20',
    imageUrl: null,
  },
  {
    id: 'mock_customer_3',
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '(555) 345-6789',
    totalAppointments: 5,
    totalSpent: 750,
    lastVisit: '2024-01-10',
    averageRating: 4.5,
    joinedDate: '2023-09-08',
    imageUrl: null,
  },
  {
    id: 'mock_customer_4',
    name: 'David Martinez',
    email: 'david.m@example.com',
    phone: '(555) 456-7890',
    totalAppointments: 15,
    totalSpent: 3000,
    lastVisit: '2024-01-20',
    averageRating: 5.0,
    joinedDate: '2023-01-10',
    imageUrl: null,
  },
];

/**
 * GET /api/provider/customers
 * Get customers for the current provider (aggregated from appointments)
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
        customers: mockCustomers,
        stats: {
          totalCustomers: mockCustomers.length,
          totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
          averageCustomerValue: Math.round(mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.length),
          averageRating: +(mockCustomers.reduce((sum, c) => sum + c.averageRating, 0) / mockCustomers.length).toFixed(1),
        },
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

    // Get all appointments for this provider with customer info
    const appointments = await prisma.appointment.findMany({
      where: { providerId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Get reviews for this provider
    const reviews = await prisma.review.findMany({
      where: { providerId },
      select: {
        customerId: true,
        rating: true,
      },
    });

    // Aggregate customer data
    const customerMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      totalAppointments: number;
      totalSpent: number;
      lastVisit: string;
      ratings: number[];
      joinedDate: string;
      imageUrl: string | null;
    }>();

    for (const apt of appointments) {
      const customerId = apt.customer.id;
      const existing = customerMap.get(customerId);

      if (existing) {
        existing.totalAppointments++;
        existing.totalSpent += apt.amount;
        if (new Date(apt.date) > new Date(existing.lastVisit)) {
          existing.lastVisit = apt.date.toISOString();
        }
      } else {
        customerMap.set(customerId, {
          id: customerId,
          name: `${apt.customer.firstName || ''} ${apt.customer.lastName || ''}`.trim() || 'Unknown',
          email: apt.customer.email,
          phone: '', // Phone is in CustomerProfile, not User
          totalAppointments: 1,
          totalSpent: apt.amount,
          lastVisit: apt.date.toISOString(),
          ratings: [],
          joinedDate: apt.customer.createdAt.toISOString(),
          imageUrl: apt.customer.imageUrl,
        });
      }
    }

    // Add review ratings
    for (const review of reviews) {
      const customer = customerMap.get(review.customerId);
      if (customer) {
        customer.ratings.push(review.rating);
      }
    }

    // Convert to array and calculate averages
    const customers = Array.from(customerMap.values()).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalAppointments: c.totalAppointments,
      totalSpent: c.totalSpent,
      lastVisit: c.lastVisit.split('T')[0],
      averageRating: c.ratings.length > 0
        ? +(c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length).toFixed(1)
        : 0,
      joinedDate: c.joinedDate.split('T')[0],
      imageUrl: c.imageUrl,
    }));

    // Sort by total spent descending
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    // Calculate stats
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const ratingsWithValue = customers.filter(c => c.averageRating > 0);
    const averageRating = ratingsWithValue.length > 0
      ? +(ratingsWithValue.reduce((sum, c) => sum + c.averageRating, 0) / ratingsWithValue.length).toFixed(1)
      : 0;

    return NextResponse.json({
      customers,
      stats: {
        totalCustomers: customers.length,
        totalRevenue,
        averageCustomerValue: customers.length > 0 ? Math.round(totalRevenue / customers.length) : 0,
        averageRating,
      },
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get provider customers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get customers' },
      { status: 500 }
    );
  }
}
