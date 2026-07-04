import type { CurrencyCode } from '@spend-share/types'

const currencyFractions: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  HUF: 0,
  GBP: 2
}

export function getCurrencyFraction(currency: CurrencyCode) {
  return currencyFractions[currency]
}

export function parseMoneyToMinor(value: string | number, currency: CurrencyCode) {
  const normalized = String(value ?? '').trim().replace(',', '.')
  if (!normalized) return 0

  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) return Number.NaN

  return Math.round(amount * 10 ** getCurrencyFraction(currency))
}

export function minorToMajor(amountMinor: number, currency: CurrencyCode) {
  return amountMinor / 10 ** getCurrencyFraction(currency)
}

export function majorToMinor(amountMajor: number, currency: CurrencyCode) {
  return Math.round(amountMajor * 10 ** getCurrencyFraction(currency))
}

export function convertMinorCurrency(
  amountMinor: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rate: number
) {
  if (from === to) return amountMinor
  return majorToMinor(minorToMajor(amountMinor, from) * rate, to)
}

export function formatMoney(amountMinor: number, currency: CurrencyCode) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: getCurrencyFraction(currency),
    minimumFractionDigits: getCurrencyFraction(currency)
  }).format(minorToMajor(amountMinor, currency))
}

export function splitEvenly(amountMinor: number, memberIds: string[]) {
  if (memberIds.length === 0) return []

  const baseShare = Math.floor(amountMinor / memberIds.length)
  let remainder = amountMinor - baseShare * memberIds.length

  return memberIds.map((memberId) => {
    const extra = remainder > 0 ? 1 : 0
    remainder -= extra

    return {
      memberId,
      shareMinor: baseShare + extra
    }
  })
}
