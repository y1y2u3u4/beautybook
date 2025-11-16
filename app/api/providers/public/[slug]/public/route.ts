import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find provider by booking slug
    const provider = await prisma.providerProfile.findUnique({
      where: {
        bookingSlug: slug,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        services: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            category: true,
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if public booking is enabled
    if (!provider.publicBookingEnabled) {
      return NextResponse.json(
        { error: 'Public booking is not available for this provider' },
        { status: 403 }
      );
    }

    // Return public provider information
    return NextResponse.json({
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        title: provider.title,
        bio: provider.bio,
        phone: provider.phone,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        zipCode: provider.zipCode,
        imageUrl: provider.user.imageUrl,
        averageRating: provider.averageRating,
        reviewCount: provider.reviewCount,
      },
      services: provider.services,
    });
  } catch (error) {
    console.error('Error fetching public provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
