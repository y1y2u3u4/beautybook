import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateCancellationFee, getPolicyDescription } from '@/lib/cancellation/policy'

describe('calculateCancellationFee', () => {
  beforeEach(() => {
    // Mock current time to 2024-12-15 10:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-12-15T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('FLEXIBLE policy', () => {
    it('should always allow free cancellation', () => {
      const appointmentDate = new Date('2024-12-15T11:00:00') // 1 hour from now
      const result = calculateCancellationFee('FLEXIBLE', appointmentDate, 100)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(0)
      expect(result.feeAmount).toBe(0)
      expect(result.reason).toBe('Free cancellation')
    })
  })

  describe('MODERATE policy (12 hours)', () => {
    it('should allow free cancellation with 12+ hours notice', () => {
      const appointmentDate = new Date('2024-12-16T10:00:00') // 24 hours from now
      const result = calculateCancellationFee('MODERATE', appointmentDate, 100)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(0)
      expect(result.feeAmount).toBe(0)
    })

    it('should charge 50% with less than 12 hours notice', () => {
      const appointmentDate = new Date('2024-12-15T18:00:00') // 8 hours from now
      const result = calculateCancellationFee('MODERATE', appointmentDate, 100)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(50)
      expect(result.feeAmount).toBe(50)
    })
  })

  describe('STANDARD policy (24 hours)', () => {
    it('should allow free cancellation with 24+ hours notice', () => {
      const appointmentDate = new Date('2024-12-17T10:00:00') // 48 hours from now
      const result = calculateCancellationFee('STANDARD', appointmentDate, 200)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(0)
      expect(result.feeAmount).toBe(0)
    })

    it('should charge 50% with less than 24 hours notice', () => {
      const appointmentDate = new Date('2024-12-16T08:00:00') // 22 hours from now
      const result = calculateCancellationFee('STANDARD', appointmentDate, 200)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(50)
      expect(result.feeAmount).toBe(100)
    })
  })

  describe('STRICT policy (48 hours)', () => {
    it('should allow free cancellation with 48+ hours notice', () => {
      const appointmentDate = new Date('2024-12-18T10:00:00') // 72 hours from now
      const result = calculateCancellationFee('STRICT', appointmentDate, 150)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(0)
      expect(result.feeAmount).toBe(0)
    })

    it('should charge 50% with 24-48 hours notice', () => {
      const appointmentDate = new Date('2024-12-17T00:00:00') // 38 hours from now
      const result = calculateCancellationFee('STRICT', appointmentDate, 150)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(50)
      expect(result.feeAmount).toBe(75)
    })

    it('should charge 100% with less than 24 hours notice', () => {
      const appointmentDate = new Date('2024-12-16T08:00:00') // 22 hours from now
      const result = calculateCancellationFee('STRICT', appointmentDate, 150)

      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(100)
      expect(result.feeAmount).toBe(150)
    })
  })

  describe('Past appointments', () => {
    it('should not allow cancellation for past appointments', () => {
      const appointmentDate = new Date('2024-12-15T09:00:00') // 1 hour ago
      const result = calculateCancellationFee('FLEXIBLE', appointmentDate, 100)

      expect(result.canCancel).toBe(false)
      expect(result.feePercentage).toBe(100)
      expect(result.feeAmount).toBe(100)
      expect(result.reason).toBe('Appointment has already passed')
    })
  })

  describe('Custom rules', () => {
    it('should use custom hours and percentage when provided', () => {
      const appointmentDate = new Date('2024-12-15T14:00:00') // 4 hours from now
      const result = calculateCancellationFee(
        'STANDARD',
        appointmentDate,
        100,
        6, // custom hours
        25 // custom percentage
      )

      // With custom rules: 6 hours required, we have 4 hours, so fee applies
      expect(result.canCancel).toBe(true)
      expect(result.feePercentage).toBe(25)
      expect(result.feeAmount).toBe(25)
    })
  })
})

describe('getPolicyDescription', () => {
  it('should return FLEXIBLE policy description', () => {
    const result = getPolicyDescription('FLEXIBLE')
    expect(result.title).toBe('Flexible Cancellation')
    expect(result.rules).toContain('✅ Cancel anytime with no fee')
  })

  it('should return MODERATE policy description', () => {
    const result = getPolicyDescription('MODERATE')
    expect(result.title).toBe('Moderate Cancellation')
    expect(result.rules.some(r => r.includes('12 hours'))).toBe(true)
  })

  it('should return STANDARD policy description', () => {
    const result = getPolicyDescription('STANDARD')
    expect(result.title).toBe('Standard Cancellation')
    expect(result.rules.some(r => r.includes('24 hours'))).toBe(true)
  })

  it('should return STRICT policy description', () => {
    const result = getPolicyDescription('STRICT')
    expect(result.title).toBe('Strict Cancellation')
    expect(result.rules.some(r => r.includes('48 hours'))).toBe(true)
  })

  it('should return default description for unknown policy', () => {
    const result = getPolicyDescription('UNKNOWN' as any)
    expect(result.title).toBe('Cancellation Policy')
    expect(result.rules).toContain('Please contact provider for details')
  })
})
