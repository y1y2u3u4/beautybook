import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/db-utils';
import { handleApiError } from '@/lib/api-utils';
import { validateFloat, validateString } from '@/lib/validation';
import { createLogger } from '@/lib/logger';
import { mockProviders, mockServices } from '@/lib/mock-db';
import { Prisma } from '@prisma/client';

const logger = createLogger('Providers API');

// Type for provider filter
interface ProviderWhereClause {
  city?: string;
  state?: string;
  averageRating?: { gte: number };
  verified?: boolean;
  priceMin?: { gte: number };
  priceMax?: { lte: number };
  specialties?: { hasSome: string[] };
  OR?: Array<{
    businessName?: { contains: string; mode: 'insensitive' };
    title?: { contains: string; mode: 'insensitive' };
    bio?: { contains: string; mode: 'insensitive' };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate filters from query parameters
    const filters = {
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || undefined,
      minRating: validateFloat(searchParams.get('minRating') || undefined, 'minRating', { min: 0, max: 5 }),
      minPrice: validateFloat(searchParams.get('minPrice') || undefined, 'minPrice', { min: 0 }),
      maxPrice: validateFloat(searchParams.get('maxPrice') || undefined, 'maxPrice', { min: 0 }),
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      search: validateString(searchParams.get('search') || undefined, 'search', { maxLength: 100 }),
    };

    // Try database first, fallback to mock data
    const dbAvailable = await isDatabaseAvailable();
    let useDatabase = dbAvailable;

    if (useDatabase) {
      try {
        // Build type-safe where clause
        const whereClause: ProviderWhereClause = {};

        if (filters.city) {
          whereClause.city = filters.city;
        }
        if (filters.state) {
          whereClause.state = filters.state;
        }
        if (filters.minRating) {
          whereClause.averageRating = { gte: filters.minRating };
        }
        if (filters.verified !== undefined) {
          whereClause.verified = filters.verified;
        }
        if (filters.minPrice) {
          whereClause.priceMin = { gte: filters.minPrice };
        }
        if (filters.maxPrice) {
          whereClause.priceMax = { lte: filters.maxPrice };
        }
        if (filters.specialties && filters.specialties.length > 0) {
          whereClause.specialties = { hasSome: filters.specialties };
        }
        if (filters.search) {
          whereClause.OR = [
            { businessName: { contains: filters.search, mode: 'insensitive' } },
            { title: { contains: filters.search, mode: 'insensitive' } },
            { bio: { contains: filters.search, mode: 'insensitive' } },
          ];
        }

        const providers = await prisma.providerProfile.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
            services: {
              where: { active: true },
              take: 5,
            },
          },
          orderBy: [
            { averageRating: 'desc' },
            { reviewCount: 'desc' },
          ],
        });

        return NextResponse.json({ providers, source: 'database' });
      } catch (dbError) {
        logger.warn('Database query failed, falling back to mock data', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
        });
        useDatabase = false;
      }
    }

    // Fallback to mock data
    logger.debug('Using mock data - database unavailable');

    let providers = [...mockProviders];

    // Apply filters to mock data
    if (filters.city) {
      providers = providers.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters.state) {
      providers = providers.filter(p => p.state.toLowerCase() === filters.state!.toLowerCase());
    }
    if (filters.minRating) {
      providers = providers.filter(p => p.averageRating >= filters.minRating!);
    }
    if (filters.verified !== undefined) {
      providers = providers.filter(p => p.verified === filters.verified);
    }
    if (filters.minPrice) {
      providers = providers.filter(p => p.priceMin >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      providers = providers.filter(p => p.priceMax <= filters.maxPrice!);
    }
    if (filters.specialties && filters.specialties.length > 0) {
      providers = providers.filter(p =>
        filters.specialties!.some(s => p.specialties.includes(s))
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      providers = providers.filter(p =>
        p.businessName.toLowerCase().includes(searchLower) ||
        p.title.toLowerCase().includes(searchLower) ||
        p.bio.toLowerCase().includes(searchLower)
      );
    }

    // Sort by rating
    providers.sort((a, b) => b.averageRating - a.averageRating);

    // Add services to each provider
    const providersWithServices = providers.map(p => ({
      ...p,
      services: mockServices.filter(s => s.providerId === p.id && s.active).slice(0, 5),
    }));

    return NextResponse.json({ providers: providersWithServices, source: 'mock' });
  } catch (error) {
    return handleApiError(error, 'Providers GET');
  }
}
