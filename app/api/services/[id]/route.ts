import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/services/[id]
 * Get a specific service
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('[API] Failed to get service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get service' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services/[id]
 * Update a service
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Get the service and verify ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: { user: true },
        },
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (existingService.provider.user.clerkId !== clerkUserId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this service' },
        { status: 403 }
      );
    }

    const { name, description, duration, price, category, active } = body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(category !== undefined && { category }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error: any) {
    console.error('[API] Failed to update service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 * Delete a service
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get the service and verify ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: { user: true },
        },
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (existingService.provider.user.clerkId !== clerkUserId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this service' },
        { status: 403 }
      );
    }

    // Check if there are any future appointments with this service
    const futureAppointments = await prisma.appointment.count({
      where: {
        serviceId: id,
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    });

    if (futureAppointments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with upcoming appointments. Please cancel or complete them first.' },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] Failed to delete service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}
