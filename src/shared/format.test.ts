import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatNumber, formatPercent } from './format'

describe('regional formatters', () => {
  it('formats MXN according to the selected language', () => {
    expect(formatCurrency(11210000, 'es')).toContain('11,210,000')
    expect(formatCurrency(11210000, 'en')).toContain('11,210,000')
  })

  it('formats numbers, percentages and dates without relying on UI components', () => {
    expect(formatNumber(18450000, 'es')).toBe('18,450,000')
    expect(formatPercent(64, 'en')).toBe('64%')
    expect(formatDate('2026-07-18', 'en')).toContain('Jul')
  })
})
