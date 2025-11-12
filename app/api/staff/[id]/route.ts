import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/staff/[id] - Update staff member
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

    // Verify staff belongs to this provider
    const existingStaff = await prisma.staff.findUnique({
      where: { id: params.id },
    });

    if (!existingStaff || existingStaff.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, phone, title, bio, specialties, avatar, active } = body;

    // Update staff member
    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(title && { title }),
        ...(bio !== undefined && { bio }),
        ...(specialties && { specialties }),
        ...(avatar !== undefined && { avatar }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ staff });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE /api/staff/[id] - Delete staff member
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

    // Verify staff belongs to this provider
    const existingStaff = await prisma.staff.findUnique({
      where: { id: params.id },
    });

    if (!existingStaff || existingStaff.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Delete staff member (this will fail if there are assigned appointments)
    await prisma.staff.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete staff with assigned appointments' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
