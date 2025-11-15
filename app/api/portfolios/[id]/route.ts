import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/portfolios/[id]
 * Get a single portfolio by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Increment view count
    await prisma.portfolio.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        provider: true,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ portfolio });
  } catch (error: any) {
    console.error('[API] Failed to fetch portfolio:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/portfolios/[id]
 * Update a portfolio
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, category, featured } = body;

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        title,
        description,
        category,
        featured,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error: any) {
    console.error('[API] Failed to update portfolio:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolios/[id]
 * Delete a portfolio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] Failed to delete portfolio:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}
