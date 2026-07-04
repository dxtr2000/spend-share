import { describe, expect, it } from 'vitest'

import { convertMinorCurrency, parseMoneyToMinor, splitEvenly } from '.'

describe('money helpers', () => {
  it('parses decimal currencies into minor units', () => {
    expect(parseMoneyToMinor('12.34', 'EUR')).toBe(1234)
    expect(parseMoneyToMinor('12,35', 'USD')).toBe(1235)
  })

  it('parses zero-fraction currencies', () => {
    expect(parseMoneyToMinor('1299', 'HUF')).toBe(1299)
  })

  it('converts zero-fraction source currencies into decimal target minor units', () => {
    expect(convertMinorCurrency(5000, 'HUF', 'USD', 0.0028)).toBe(1400)
  })

  it('converts decimal source currencies into zero-fraction target minor units', () => {
    expect(convertMinorCurrency(1000, 'USD', 'HUF', 350)).toBe(3500)
  })

  it('distributes rounding remainder deterministically', () => {
    expect(splitEvenly(100, ['a', 'b', 'c'])).toEqual([
      { memberId: 'a', shareMinor: 34 },
      { memberId: 'b', shareMinor: 33 },
      { memberId: 'c', shareMinor: 33 }
    ])
  })
})
