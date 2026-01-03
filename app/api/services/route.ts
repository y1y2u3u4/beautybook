import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/db-utils';
import { handleApiError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/api-utils';
import { validateString, validateInt, validateFloat } from '@/lib/validation';
import { mockServices } from '@/lib/mock-db';

// Type for service filter
interface ServiceWhereClause {
  providerId: string;
  category?: string;
  active?: boolean;
}

/**
 * GET /api/services
 * Get services for a provider or current user's provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let providerId = searchParams.get('providerId');
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const myServices = searchParams.get('my') === 'true';

    const dbAvailable = await isDatabaseAvailable();

    // If requesting own services, get provider ID from auth
    if (myServices) {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        throw new UnauthorizedError('Authentication required');
      }

      if (dbAvailable) {
        const user = await prisma.user.findUnique({
          where: { clerkId: clerkUserId },
          include: { providerProfile: true },
        });

        if (user?.providerProfile) {
          providerId = user.providerProfile.id;
        } else {
          // User is not a provider, return mock data
          return NextResponse.json({ services: mockServices, source: 'mock' });
        }
      } else {
        return NextResponse.json({ services: mockServices, source: 'mock' });
      }
    }

    if (!providerId) {
      return NextResponse.json({ services: mockServices, source: 'mock' });
    }

    if (!dbAvailable) {
      const filtered = mockServices.filter(s => s.providerId === providerId);
      return NextResponse.json({ services: filtered.length ? filtered : mockServices, source: 'mock' });
    }

    const whereClause: ServiceWhereClause = { providerId };

    if (category) {
      whereClause.category = category;
    }

    if (active !== null && active !== undefined) {
      whereClause.active = active === 'true';
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ services, source: 'database' });
  } catch (error) {
    return handleApiError(error, 'Services GET');
  }
}

/**
 * POST /api/services
 * Create a new service (provider only)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      throw new ForbiddenError('Only providers can create services');
    }

    const body = await request.json();
    const { name, description, duration, price, category } = body;

    // Validate required fields with proper type checking
    const validatedName = validateString(name, 'name', { required: true, minLength: 2, maxLength: 100 });
    const validatedDescription = validateString(description, 'description', { required: true, minLength: 10, maxLength: 1000 });
    const validatedDuration = validateInt(duration, 'duration', { required: true, min: 5, max: 480 }); // 5 min to 8 hours
    const validatedPrice = validateFloat(price, 'price', { required: true, min: 0, max: 10000 });
    const validatedCategory = validateString(category, 'category', { required: true, minLength: 2, maxLength: 50 });

    if (!validatedName || !validatedDescription || !validatedDuration || validatedPrice === undefined || !validatedCategory) {
      throw new ValidationError('Missing required fields');
    }

    const service = await prisma.service.create({
      data: {
        providerId: user.providerProfile.id,
        name: validatedName,
        description: validatedDescription,
        duration: validatedDuration,
        price: validatedPrice,
        category: validatedCategory,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    return handleApiError(error, 'Services POST');
  }
}

/**
 * PUT /api/services
 * Update a service (provider only)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      throw new ForbiddenError('Only providers can update services');
    }

    const body = await request.json();
    const { serviceId, name, description, duration, price, category, active } = body;

    validateString(serviceId, 'serviceId', { required: true });

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw new NotFoundError('Service not found');
    }

    if (existingService.providerId !== user.providerProfile.id) {
      throw new ForbiddenError('You can only update your own services');
    }

    // Build update data
    const updateData: {
      name?: string;
      description?: string;
      duration?: number;
      price?: number;
      category?: string;
      active?: boolean;
    } = {};

    if (name !== undefined) {
      const validated = validateString(name, 'name', { minLength: 2, maxLength: 100 });
      if (validated) updateData.name = validated;
    }

    if (description !== undefined) {
      const validated = validateString(description, 'description', { minLength: 10, maxLength: 1000 });
      if (validated) updateData.description = validated;
    }

    if (duration !== undefined) {
      const validated = validateInt(duration, 'duration', { min: 5, max: 480 });
      if (validated) updateData.duration = validated;
    }

    if (price !== undefined) {
      const validated = validateFloat(price, 'price', { min: 0, max: 10000 });
      if (validated !== undefined) updateData.price = validated;
    }

    if (category !== undefined) {
      const validated = validateString(category, 'category', { minLength: 2, maxLength: 50 });
      if (validated) updateData.category = validated;
    }

    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    return handleApiError(error, 'Services PUT');
  }
}

/**
 * DELETE /api/services
 * Delete a service (provider only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      throw new ForbiddenError('Only providers can delete services');
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      throw new ValidationError('serviceId is required');
    }

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw new NotFoundError('Service not found');
    }

    if (existingService.providerId !== user.providerProfile.id) {
      throw new ForbiddenError('You can only delete your own services');
    }

    // Check if service has any upcoming appointments
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        serviceId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        date: { gte: new Date() },
      },
    });

    if (upcomingAppointments > 0) {
      throw new ValidationError(
        `Cannot delete service with ${upcomingAppointments} upcoming appointment(s). Please cancel or reschedule them first.`
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Services DELETE');
  }
}
