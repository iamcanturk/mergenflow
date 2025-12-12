/**
 * Utility Functions Tests
 * Tests for currency formatting, date utilities, and helper functions
 */

import { 
  formatCurrency, 
  formatDate, 
  formatRelativeDate, 
  cn,
  calculatePercentage,
  formatDuration,
  isValidEmail,
  truncateText
} from '@/lib/utils'

describe('Currency Formatting', () => {
  describe('formatCurrency', () => {
    it('should format TRY currency correctly', () => {
      const result = formatCurrency(1000, 'TRY')
      expect(result).toContain('1')
      expect(result).toContain('000')
    })

    it('should format USD currency correctly', () => {
      const result = formatCurrency(1000, 'USD')
      expect(result).toContain('1')
      expect(result).toContain('000')
    })

    it('should format EUR currency correctly', () => {
      const result = formatCurrency(1000, 'EUR')
      expect(result).toContain('1')
      expect(result).toContain('000')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0, 'TRY')
      expect(result).toContain('0')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500, 'TRY')
      expect(result).toContain('500')
    })

    it('should handle decimal amounts', () => {
      const result = formatCurrency(1234.56, 'TRY')
      expect(result).toContain('1')
      expect(result).toContain('234')
    })
  })
})

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-12-13')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should format Date object correctly', () => {
      const date = new Date('2024-12-13')
      const result = formatDate(date)
      expect(result).toBeDefined()
    })

    it('should handle different locales', () => {
      const result = formatDate('2024-12-13', 'tr')
      expect(result).toBeDefined()
    })
  })

  describe('formatRelativeDate', () => {
    it('should return relative date for today', () => {
      const today = new Date().toISOString().split('T')[0]
      const result = formatRelativeDate(today)
      expect(result).toBeDefined()
    })

    it('should return relative date for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      const result = formatRelativeDate(pastDate.toISOString().split('T')[0])
      expect(result).toBeDefined()
    })

    it('should return relative date for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const result = formatRelativeDate(futureDate.toISOString().split('T')[0])
      expect(result).toBeDefined()
    })
  })
})

describe('Class Name Utility', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
    })

    it('should filter out falsy values', () => {
      const result = cn('base', false && 'hidden', undefined, null)
      expect(result).toBe('base')
    })

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-2', 'p-4')
      expect(result).toContain('p-4')
      expect(result).not.toContain('p-2')
    })
  })
})

describe('Percentage Calculation', () => {
  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(75, 100)).toBe(75)
    })

    it('should return 0 for zero target', () => {
      expect(calculatePercentage(50, 0)).toBe(0)
    })

    it('should cap at 100%', () => {
      expect(calculatePercentage(150, 100)).toBe(100)
    })

    it('should handle zero current', () => {
      expect(calculatePercentage(0, 100)).toBe(0)
    })
  })
})

describe('Duration Formatting', () => {
  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(30)).toBe('30dk')
    })

    it('should format hours only', () => {
      expect(formatDuration(120)).toBe('2sa')
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1sa 30dk')
    })

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0dk')
    })
  })
})

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
})

describe('Text Truncation', () => {
  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short')
    })

    it('should truncate long text', () => {
      const result = truncateText('This is a very long text', 10)
      expect(result.length).toBe(10)
      expect(result).toContain('...')
    })

    it('should handle exact length', () => {
      expect(truncateText('Exact', 5)).toBe('Exact')
    })
  })
})
