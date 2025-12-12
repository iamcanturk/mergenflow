import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns"
import { tr, enUS } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency amount with locale-specific formatting
 */
export function formatCurrency(
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY',
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to locale-specific string
 */
export function formatDate(
  date: string | Date,
  locale: string = 'tr',
  formatStr: string = 'dd MMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return '-'
  
  const localeObj = locale === 'tr' ? tr : enUS
  return format(dateObj, formatStr, { locale: localeObj })
}

/**
 * Format date to relative string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeDate(
  date: string | Date,
  locale: string = 'tr'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return '-'
  
  const localeObj = locale === 'tr' ? tr : enUS
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: localeObj })
}

/**
 * Calculate percentage
 */
export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}dk`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}sa ${mins}dk` : `${hours}sa`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
