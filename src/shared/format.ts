import type { i18n } from 'i18next'

export const localeFor = (language: string) => (language === 'en' ? 'en-MX' : 'es-MX')

export const formatCurrency = (value: number, language = 'es') =>
  new Intl.NumberFormat(localeFor(language), {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)

export const formatNumber = (value: number, language = 'es') =>
  new Intl.NumberFormat(localeFor(language)).format(value)

export const formatPercent = (value: number, language = 'es') =>
  new Intl.NumberFormat(localeFor(language), { style: 'percent', maximumFractionDigits: 0 }).format(
    value / 100,
  )

export const formatDate = (value: Date | string, language = 'es') =>
  new Intl.DateTimeFormat(localeFor(language), { dateStyle: 'medium' }).format(
    typeof value === 'string' ? new Date(`${value}T12:00:00`) : value,
  )

export const currentLanguage = (instance: i18n) =>
  instance.resolvedLanguage ?? instance.language ?? 'es'
