import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reviews
 * Get reviews for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { providerId },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.review.count({ where: { providerId } }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { providerId },
      _count: { rating: true },
    });

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r.rating] = r._count.rating;
    });

    return NextResponse.json({
      reviews,
      total,
      ratingDistribution: distribution,
      pagination: {
        limit,
        offset,
        hasMore: offset + reviews.length < total,
      },
    });
  } catch (error: any) {
    console.error('[API] Failed to get reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { providerId, rating, comment, appointmentId } = body;

    // Validate required fields
    if (!providerId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId, rating, comment' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has a completed appointment with this provider
    const completedAppointment = await prisma.appointment.findFirst({
      where: {
        customerId: user.id,
        providerId,
        status: 'COMPLETED',
        ...(appointmentId && { id: appointmentId }),
      },
    });

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        customerId: user.id,
        providerId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this provider' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        customerId: user.id,
        providerId,
        rating,
        comment,
        verified: !!completedAppointment, // Verified if has completed appointment
      },
    });

    // Update provider's average rating
    const aggregatedRatings = await prisma.review.aggregate({
      where: { providerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        averageRating: aggregatedRatings._avg.rating || 0,
        reviewCount: aggregatedRatings._count.rating,
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error: any) {
    console.error('[API] Failed to create review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
