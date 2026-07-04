import { describe, expect, it } from 'vitest'

import type { Expense, RecordedSettlement } from '@spend-share/types'

import { calculateMemberBalances, optimizeSettlements } from '.'

const memberIds = ['anna', 'ben', 'mila']

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: crypto.randomUUID(),
    eventId: 'group',
    title: 'Test',
    amountMinor: 0,
    currency: 'EUR',
    paidByMemberId: 'anna',
    date: '2026-07-03',
    participants: [],
    ...overrides
  }
}

describe('settlement engine', () => {
  it('splits one payer expense equally', () => {
    const balances = calculateMemberBalances(memberIds, [
      expense({
        amountMinor: 9000,
        paidByMemberId: 'anna',
        participants: [
          { memberId: 'anna', shareMinor: 3000 },
          { memberId: 'ben', shareMinor: 3000 },
          { memberId: 'mila', shareMinor: 3000 }
        ]
      })
    ])

    expect(balances).toEqual([
      { memberId: 'anna', balanceMinor: 6000 },
      { memberId: 'ben', balanceMinor: -3000 },
      { memberId: 'mila', balanceMinor: -3000 }
    ])
    expect(optimizeSettlements(balances)).toEqual([
      { fromMemberId: 'ben', toMemberId: 'anna', amountMinor: 3000 },
      { fromMemberId: 'mila', toMemberId: 'anna', amountMinor: 3000 }
    ])
  })

  it('nets opposing debts across expenses', () => {
    const balances = calculateMemberBalances(['anna', 'ben'], [
      expense({
        amountMinor: 4000,
        paidByMemberId: 'ben',
        participants: [
          { memberId: 'anna', shareMinor: 2000 },
          { memberId: 'ben', shareMinor: 2000 }
        ]
      }),
      expense({
        amountMinor: 1600,
        paidByMemberId: 'anna',
        participants: [
          { memberId: 'anna', shareMinor: 800 },
          { memberId: 'ben', shareMinor: 800 }
        ]
      })
    ])

    expect(optimizeSettlements(balances)).toEqual([
      { fromMemberId: 'anna', toMemberId: 'ben', amountMinor: 1200 }
    ])
  })

  it('supports custom shares', () => {
    const balances = calculateMemberBalances(memberIds, [
      expense({
        amountMinor: 10000,
        paidByMemberId: 'mila',
        participants: [
          { memberId: 'anna', shareMinor: 5000 },
          { memberId: 'ben', shareMinor: 3000 },
          { memberId: 'mila', shareMinor: 2000 }
        ]
      })
    ])

    expect(optimizeSettlements(balances)).toEqual([
      { fromMemberId: 'anna', toMemberId: 'mila', amountMinor: 5000 },
      { fromMemberId: 'ben', toMemberId: 'mila', amountMinor: 3000 }
    ])
  })

  it('handles zero-balance members', () => {
    const balances = calculateMemberBalances(memberIds, [])

    expect(balances.every((balance) => balance.balanceMinor === 0)).toBe(true)
    expect(optimizeSettlements(balances)).toEqual([])
  })

  it('subtracts recorded settlement payments from outstanding balances', () => {
    const recorded: RecordedSettlement[] = [
      {
        id: 'settlement',
        eventId: 'group',
        fromMemberId: 'ben',
        toMemberId: 'anna',
        amountMinor: 2000,
        currency: 'EUR',
        createdAt: '2026-07-03T00:00:00.000Z'
      }
    ]
    const balances = calculateMemberBalances(memberIds, [
      expense({
        amountMinor: 9000,
        paidByMemberId: 'anna',
        participants: [
          { memberId: 'anna', shareMinor: 3000 },
          { memberId: 'ben', shareMinor: 3000 },
          { memberId: 'mila', shareMinor: 3000 }
        ]
      })
    ], recorded)

    expect(optimizeSettlements(balances)).toEqual([
      { fromMemberId: 'mila', toMemberId: 'anna', amountMinor: 3000 },
      { fromMemberId: 'ben', toMemberId: 'anna', amountMinor: 1000 }
    ])
  })
})
