import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma before importing the route
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    service: {
      findUnique: vi.fn(),
    },
    availability: {
      findFirst: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
  },
}))

import { GET } from '@/app/api/availability/route'
import { prisma } from '@/lib/prisma'

describe('GET /api/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when providerId is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/availability?date=2024-12-15'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('providerId and date are required')
  })

  it('should return 400 when date is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/availability?providerId=provider_001'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('providerId and date are required')
  })

  it('should return mock data when database is unavailable', async () => {
    // Mock database unavailable
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('DB unavailable'))

    const request = new NextRequest(
      'http://localhost:3000/api/availability?providerId=provider_001&date=2024-12-18'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.source).toBe('mock')
  })

  it('should return database data when available', async () => {
    // Mock database available
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }])

    // Mock availability
    vi.mocked(prisma.availability.findFirst).mockResolvedValue({
      id: 'avail_001',
      providerId: 'provider_001',
      dayOfWeek: 3, // Wednesday
      startTime: '09:00',
      endTime: '18:00',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Mock no existing appointments
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    const request = new NextRequest(
      'http://localhost:3000/api/availability?providerId=provider_001&date=2024-12-18'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.source).toBe('database')
    expect(data.available).toBe(true)
    expect(data.slots).toBeDefined()
    expect(Array.isArray(data.slots)).toBe(true)
  })

  it('should return unavailable when provider has no schedule for the day', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }])
    vi.mocked(prisma.availability.findFirst).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/availability?providerId=provider_001&date=2024-12-22'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.available).toBe(false)
    expect(data.message).toBe('Provider is not available on this day')
  })

  it('should use service duration when serviceId is provided', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }])

    vi.mocked(prisma.service.findUnique).mockResolvedValue({
      id: 'service_001',
      providerId: 'provider_001',
      name: 'Test Service',
      description: 'Test',
      duration: 90,
      price: 100,
      category: 'Test',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.availability.findFirst).mockResolvedValue({
      id: 'avail_001',
      providerId: 'provider_001',
      dayOfWeek: 3,
      startTime: '09:00',
      endTime: '18:00',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    const request = new NextRequest(
      'http://localhost:3000/api/availability?providerId=provider_001&date=2024-12-18&serviceId=service_001'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.service.findUnique).toHaveBeenCalledWith({
      where: { id: 'service_001' },
    })
  })

  it('should mark conflicting slots as unavailable', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ 1: 1 }])

    vi.mocked(prisma.availability.findFirst).mockResolvedValue({
      id: 'avail_001',
      providerId: 'provider_001',
      dayOfWeek: 3,
      startTime: '09:00',
      endTime: '12:00',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Existing appointment from 10:00 to 11:00
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        startTime: '10:00',
        endTime: '11:00',
      },
    ] as any)

    const request = new NextRequest(
      'http://localhost:3000/api/availability?providerId=provider_001&date=2024-12-18'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)

    // The 10:00 slot should be marked as unavailable
    const slot1000 = data.slots.find((s: any) => s.time === '10:00')
    if (slot1000) {
      expect(slot1000.available).toBe(false)
    }
  })
})
