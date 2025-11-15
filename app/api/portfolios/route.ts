import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/portfolios
 * Get portfolios by provider or featured
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category');

    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (featured) {
      where.featured = true;
    }

    if (category) {
      where.category = category;
    }

    const portfolios = await prisma.portfolio.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        provider: {
          select: {
            businessName: true,
            city: true,
            state: true,
            verified: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ portfolios });
  } catch (error: any) {
    console.error('[API] Failed to fetch portfolios:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolios
 * Create a new portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, title, description, category, images } = body;

    // Validate required fields
    if (!providerId || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create portfolio with images
    const portfolio = await prisma.portfolio.create({
      data: {
        providerId,
        title,
        description,
        category,
        images: {
          create: images?.map((img: any, index: number) => ({
            url: img.url,
            thumbnail: img.thumbnail || img.url,
            order: index,
            caption: img.caption,
          })) || [],
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error: any) {
    console.error('[API] Failed to create portfolio:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}
