import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user's provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        providerProfile: true,
      },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.providerProfile);
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider profile' },
      { status: 500 }
    );
  }
}
