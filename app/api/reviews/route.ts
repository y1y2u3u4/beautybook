import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/api-utils';
import { validateString, validateInt, validatePagination } from '@/lib/validation';

/**
 * GET /api/reviews
 * Get reviews for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      throw new ValidationError('providerId is required');
    }

    const { page, pageSize, skip } = validatePagination(
      searchParams.get('page') || undefined,
      searchParams.get('limit') || searchParams.get('pageSize') || undefined
    );
    const offset = validateInt(searchParams.get('offset'), 'offset', { min: 0 }) || skip;

    // Use Promise.all to optimize database queries
    const [reviews, total, ratingDistribution] = await Promise.all([
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
        take: pageSize,
      }),
      prisma.review.count({ where: { providerId } }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { providerId },
        _count: { rating: true },
      }),
    ]);

    // Build rating distribution object
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r.rating] = r._count.rating;
    });

    return NextResponse.json({
      reviews,
      total,
      ratingDistribution: distribution,
      pagination: {
        page,
        pageSize,
        offset,
        hasMore: offset + reviews.length < total,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Reviews GET');
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
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const body = await request.json();
    const { providerId, rating, comment, appointmentId } = body;

    // Validate required fields
    validateString(providerId, 'providerId', { required: true });
    validateString(comment, 'comment', { required: true, minLength: 10, maxLength: 2000 });
    const validatedRating = validateInt(rating, 'rating', { min: 1, max: 5, required: true });

    if (!validatedRating) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    // Verify provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundError('Provider not found');
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
      throw new ValidationError('You have already reviewed this provider');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        customerId: user.id,
        providerId,
        rating: validatedRating,
        comment,
        verified: !!completedAppointment,
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
  } catch (error) {
    return handleApiError(error, 'Reviews POST');
  }
}

/**
 * PUT /api/reviews
 * Update a review (owner only)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const body = await request.json();
    const { reviewId, rating, comment } = body;

    validateString(reviewId, 'reviewId', { required: true });

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.customerId !== user.id) {
      throw new ValidationError('You can only update your own reviews');
    }

    // Build update data
    const updateData: { rating?: number; comment?: string } = {};

    if (rating !== undefined) {
      const validatedRating = validateInt(rating, 'rating', { min: 1, max: 5 });
      if (validatedRating) {
        updateData.rating = validatedRating;
      }
    }

    if (comment !== undefined) {
      const validatedComment = validateString(comment, 'comment', { minLength: 10, maxLength: 2000 });
      if (validatedComment) {
        updateData.comment = validatedComment;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    // Update provider's average rating if rating changed
    if (updateData.rating !== undefined) {
      const aggregatedRatings = await prisma.review.aggregate({
        where: { providerId: review.providerId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.providerProfile.update({
        where: { id: review.providerId },
        data: {
          averageRating: aggregatedRatings._avg.rating || 0,
          reviewCount: aggregatedRatings._count.rating,
        },
      });
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    return handleApiError(error, 'Reviews PUT');
  }
}

/**
 * DELETE /api/reviews
 * Delete a review (owner only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      throw new ValidationError('reviewId is required');
    }

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.customerId !== user.id) {
      throw new ValidationError('You can only delete your own reviews');
    }

    const providerId = review.providerId;

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
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
      message: 'Review deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Reviews DELETE');
  }
}
