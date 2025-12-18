import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  mockUsers,
  mockProviders,
  mockServices,
  mockReviews,
  mockAppointments,
  mockAvailability,
  shouldUseMockData,
  getMockProviderWithDetails,
  getMockTimeSlots,
} from '@/lib/mock-db'

describe('Mock Data Structures', () => {
  describe('mockUsers', () => {
    it('should contain users with required fields', () => {
      expect(mockUsers.length).toBeGreaterThan(0)
      mockUsers.forEach(user => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('firstName')
        expect(user).toHaveProperty('lastName')
        expect(user).toHaveProperty('role')
      })
    })

    it('should have both customers and providers', () => {
      const customers = mockUsers.filter(u => u.role === 'CUSTOMER')
      const providers = mockUsers.filter(u => u.role === 'PROVIDER')
      expect(customers.length).toBeGreaterThan(0)
      expect(providers.length).toBeGreaterThan(0)
    })
  })

  describe('mockProviders', () => {
    it('should contain providers with required business info', () => {
      expect(mockProviders.length).toBeGreaterThan(0)
      mockProviders.forEach(provider => {
        expect(provider).toHaveProperty('id')
        expect(provider).toHaveProperty('businessName')
        expect(provider).toHaveProperty('averageRating')
        expect(provider).toHaveProperty('businessHours')
        expect(provider.averageRating).toBeGreaterThanOrEqual(0)
        expect(provider.averageRating).toBeLessThanOrEqual(5)
      })
    })

    it('should have valid business hours', () => {
      mockProviders.forEach(provider => {
        const hours = provider.businessHours
        expect(hours).toHaveProperty('monday')
        expect(hours).toHaveProperty('sunday')
      })
    })
  })

  describe('mockServices', () => {
    it('should contain services with required fields', () => {
      expect(mockServices.length).toBeGreaterThan(0)
      mockServices.forEach(service => {
        expect(service).toHaveProperty('id')
        expect(service).toHaveProperty('providerId')
        expect(service).toHaveProperty('name')
        expect(service).toHaveProperty('duration')
        expect(service).toHaveProperty('price')
        expect(service.duration).toBeGreaterThan(0)
        expect(service.price).toBeGreaterThan(0)
      })
    })

    it('should have services linked to valid providers', () => {
      const providerIds = mockProviders.map(p => p.id)
      mockServices.forEach(service => {
        expect(providerIds).toContain(service.providerId)
      })
    })
  })

  describe('mockReviews', () => {
    it('should contain reviews with valid ratings', () => {
      expect(mockReviews.length).toBeGreaterThan(0)
      mockReviews.forEach(review => {
        expect(review.rating).toBeGreaterThanOrEqual(1)
        expect(review.rating).toBeLessThanOrEqual(5)
        expect(review).toHaveProperty('comment')
      })
    })
  })

  describe('mockAvailability', () => {
    it('should have valid day of week values (0-6)', () => {
      mockAvailability.forEach(avail => {
        expect(avail.dayOfWeek).toBeGreaterThanOrEqual(0)
        expect(avail.dayOfWeek).toBeLessThanOrEqual(6)
      })
    })

    it('should have valid time format', () => {
      const timeRegex = /^\d{2}:\d{2}$/
      mockAvailability.forEach(avail => {
        expect(avail.startTime).toMatch(timeRegex)
        expect(avail.endTime).toMatch(timeRegex)
      })
    })
  })
})

describe('shouldUseMockData', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return true when USE_MOCK_DATA is true', () => {
    process.env.USE_MOCK_DATA = 'true'
    process.env.NODE_ENV = 'production'
    expect(shouldUseMockData()).toBe(true)
  })

  it('should return true in development environment', () => {
    process.env.USE_MOCK_DATA = 'false'
    process.env.NODE_ENV = 'development'
    expect(shouldUseMockData()).toBe(true)
  })
})

describe('getMockProviderWithDetails', () => {
  it('should return provider with all related data', () => {
    const result = getMockProviderWithDetails('provider_001')

    expect(result).not.toBeNull()
    expect(result?.id).toBe('provider_001')
    expect(result?.services).toBeDefined()
    expect(result?.services.length).toBeGreaterThan(0)
    expect(result?.reviews).toBeDefined()
    expect(result?.education).toBeDefined()
    expect(result?.certifications).toBeDefined()
    expect(result?.availability).toBeDefined()
  })

  it('should return null for non-existent provider', () => {
    const result = getMockProviderWithDetails('non_existent')
    expect(result).toBeNull()
  })

  it('should only include services for the specified provider', () => {
    const result = getMockProviderWithDetails('provider_001')
    result?.services.forEach(service => {
      expect(service.providerId).toBe('provider_001')
    })
  })
})

describe('getMockTimeSlots', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Set to a Wednesday at 8:00 AM
    vi.setSystemTime(new Date('2024-12-18T08:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return available slots for a valid date', () => {
    // Provider 001 works on Wednesday (day 3)
    const date = new Date('2024-12-18') // Wednesday
    const result = getMockTimeSlots('provider_001', date, 60)

    expect(result.available).toBe(true)
    expect(result.slots).toBeDefined()
    expect(result.slots.length).toBeGreaterThan(0)
  })

  it('should return unavailable for non-working days', () => {
    // Provider 001 doesn't work on Sunday (day 0)
    const sunday = new Date('2024-12-22') // Sunday
    const result = getMockTimeSlots('provider_001', sunday, 60)

    expect(result.available).toBe(false)
    expect(result.message).toBe('Provider is not available on this day')
  })

  it('should respect service duration when generating slots', () => {
    const date = new Date('2024-12-18')
    const result60min = getMockTimeSlots('provider_001', date, 60)
    const result120min = getMockTimeSlots('provider_001', date, 120)

    // Longer service should have fewer available slots
    expect(result60min.slots.length).toBeGreaterThanOrEqual(result120min.slots.length)
  })

  it('should have valid time format for slots', () => {
    const date = new Date('2024-12-18')
    const result = getMockTimeSlots('provider_001', date, 60)

    const timeRegex = /^\d{2}:\d{2}$/
    result.slots.forEach(slot => {
      expect(slot.time).toMatch(timeRegex)
      expect(typeof slot.available).toBe('boolean')
    })
  })

  it('should mark past slots as unavailable for today', () => {
    // Current time is 8:00 AM
    const today = new Date('2024-12-18')
    const result = getMockTimeSlots('provider_001', today, 60)

    // Early morning slots (before 8:00) should be unavailable
    const earlySlots = result.slots.filter(s => {
      const [hour] = s.time.split(':').map(Number)
      return hour < 8
    })

    earlySlots.forEach(slot => {
      expect(slot.available).toBe(false)
    })
  })
})
