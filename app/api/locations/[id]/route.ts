import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/locations/[id] - Get a specific location
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const location = await prisma.location.findUnique({
      where: { id: params.id },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch (error: any) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// PATCH /api/locations/[id] - Update a location
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Get existing location
    const existingLocation = await prisma.location.findUnique({
      where: { id: params.id },
    });

    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Verify ownership
    if (existingLocation.providerId !== user.providerProfile.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this location' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, city, state, zipCode, phone, email, businessHours, isPrimary, active } = body;

    // If setting as primary, unset other primaries
    if (isPrimary && !existingLocation.isPrimary) {
      await prisma.location.updateMany({
        where: {
          providerId: user.providerProfile.id,
          isPrimary: true,
          id: {
            not: params.id,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update location
    const location = await prisma.location.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(businessHours !== undefined && { businessHours }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({
      success: true,
      location,
    });
  } catch (error: any) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE /api/locations/[id] - Delete a location
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Get existing location
    const location = await prisma.location.findUnique({
      where: { id: params.id },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Verify ownership
    if (location.providerId !== user.providerProfile.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this location' },
        { status: 403 }
      );
    }

    // Prevent deleting the only location
    const locationCount = await prisma.location.count({
      where: {
        providerId: user.providerProfile.id,
        active: true,
      },
    });

    if (locationCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only active location. Create another location first.' },
        { status: 400 }
      );
    }

    // If deleting primary location, assign primary to another location
    if (location.isPrimary) {
      const newPrimary = await prisma.location.findFirst({
        where: {
          providerId: user.providerProfile.id,
          active: true,
          id: {
            not: params.id,
          },
        },
      });

      if (newPrimary) {
        await prisma.location.update({
          where: { id: newPrimary.id },
          data: { isPrimary: true },
        });
      }
    }

    // Soft delete (set as inactive) rather than hard delete
    await prisma.location.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Location deactivated successfully',
    });
  } catch (error: any) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
