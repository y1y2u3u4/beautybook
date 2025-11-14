import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/services/[id] - Update service
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user?.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Verify service belongs to this provider
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existingService || existingService.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, duration, price, category, active } = body;

    // Validate numbers if provided
    if (duration !== undefined && duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      );
    }

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Update service
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(duration && { duration: parseInt(duration) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(category && { category: category.trim() }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user?.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Verify service belongs to this provider
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          where: {
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
          },
        },
      },
    });

    if (!existingService || existingService.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if service has active appointments
    if (existingService.appointments.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete service with active appointments',
          message: `此服务有 ${existingService.appointments.length} 个未完成的预约，无法删除。请先完成或取消这些预约，或将服务设为不可用。`,
        },
        { status: 400 }
      );
    }

    // Delete service
    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
