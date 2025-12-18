import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate, formatTime } from '@/lib/utils'

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', { active: true, disabled: false })
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('should handle undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })
})

describe('formatCurrency', () => {
  it('should format positive numbers as USD', () => {
    expect(formatCurrency(100)).toBe('$100.00')
  })

  it('should format decimal numbers correctly', () => {
    expect(formatCurrency(99.99)).toBe('$99.99')
  })

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('should format large numbers with comma separators', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2024-12-15')
    const result = formatDate(date)
    expect(result).toContain('Dec')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('should format date string', () => {
    const result = formatDate('2024-06-20')
    expect(result).toContain('Jun')
    expect(result).toContain('20')
    expect(result).toContain('2024')
  })
})

describe('formatTime', () => {
  it('should format Date object to time string', () => {
    const date = new Date('2024-12-15T14:30:00')
    const result = formatTime(date)
    expect(result).toMatch(/2:30\s*PM/i)
  })

  it('should format morning time', () => {
    const date = new Date('2024-12-15T09:00:00')
    const result = formatTime(date)
    expect(result).toMatch(/9:00\s*AM/i)
  })

  it('should format time string', () => {
    const result = formatTime('2024-12-15T18:45:00')
    expect(result).toMatch(/6:45\s*PM/i)
  })
})
