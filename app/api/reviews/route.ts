import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { providerId, rating, comment, appointmentId } = body;

    // Validation
    if (!providerId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Provider ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comment must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // If appointmentId provided, verify the appointment
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      if (appointment.customerId !== user.id) {
        return NextResponse.json(
          { error: 'You can only review your own appointments' },
          { status: 403 }
        );
      }

      if (appointment.providerId !== providerId) {
        return NextResponse.json(
          { error: 'Appointment provider does not match' },
          { status: 400 }
        );
      }

      if (appointment.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'You can only review completed appointments' },
          { status: 400 }
        );
      }

      // Check if already reviewed
      const existingReview = await prisma.review.findFirst({
        where: {
          customerId: user.id,
          providerId,
          // You might want to add appointmentId to Review model to prevent duplicate reviews
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this provider' },
          { status: 400 }
        );
      }
    }

    // Check if customer has had at least one completed appointment with this provider
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        customerId: user.id,
        providerId,
        status: 'COMPLETED',
      },
    });

    if (completedAppointments.length === 0) {
      return NextResponse.json(
        { error: 'You must have a completed appointment before reviewing' },
        { status: 403 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        customerId: user.id,
        providerId,
        rating: parseInt(rating),
        comment: comment.trim(),
        verified: true, // Mark as verified since we checked they had a completed appointment
      },
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
    });

    // Update provider's average rating and review count
    const allReviews = await prisma.review.findMany({
      where: { providerId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(
      {
        review,
        message: 'Review submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews - Get reviews for a provider
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
