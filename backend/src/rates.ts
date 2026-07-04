import type { CurrencyCode } from '@spend-share/types'

const RATES_TTL_MS = 5 * 60 * 1000
const ENDPOINT = 'https://api.frankfurter.dev/v1/latest'

interface FrankfurterRatesResponse {
  base: string
  rates: Record<string, number>
}

const cache = new Map<string, { fetchedAt: number; rate: number }>()

async function fetchRate(from: CurrencyCode, to: CurrencyCode): Promise<number | undefined> {
  const key = `${from}:${to}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < RATES_TTL_MS) {
    return cached.rate
  }

  const url = new URL(ENDPOINT)
  url.searchParams.set('base', from)
  url.searchParams.set('symbols', to)

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`FX rates request failed: ${response.status}`)

  const data = (await response.json()) as FrankfurterRatesResponse
  if (!data.rates || typeof data.rates !== 'object') {
    throw new Error('FX rates response missing rates object')
  }

  const rate = data.rates[to]
  if (!rate) return undefined

  cache.set(key, { fetchedAt: Date.now(), rate })
  return rate
}

/**
 * Returns the conversion rate from `from` currency to `to` currency.
 * Rate expresses: 1 unit of `from` = rate units of `to`.
 * Returns 1 if `from` === `to`, undefined if the rate cannot be determined.
 */
export async function getFxRate(from: CurrencyCode, to: CurrencyCode): Promise<number | undefined> {
  if (from === to) return 1
  try {
    return fetchRate(from, to)
  } catch {
    return undefined
  }
}
