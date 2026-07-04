import type { Expense, MemberBalance, OptimizedSettlement, RecordedSettlement } from '@spend-share/types'

export function calculateMemberBalances(
  memberIds: string[],
  expenses: Expense[],
  recordedSettlements: RecordedSettlement[] = []
): MemberBalance[] {
  const balances = new Map(memberIds.map((memberId) => [memberId, 0]))

  for (const expense of expenses) {
    balances.set(expense.paidByMemberId, (balances.get(expense.paidByMemberId) ?? 0) + expense.amountMinor)

    for (const participant of expense.participants) {
      balances.set(participant.memberId, (balances.get(participant.memberId) ?? 0) - participant.shareMinor)
    }
  }

  for (const settlement of recordedSettlements) {
    balances.set(settlement.fromMemberId, (balances.get(settlement.fromMemberId) ?? 0) + settlement.amountMinor)
    balances.set(settlement.toMemberId, (balances.get(settlement.toMemberId) ?? 0) - settlement.amountMinor)
  }

  return memberIds.map((memberId) => ({
    memberId,
    balanceMinor: balances.get(memberId) ?? 0
  }))
}

export function optimizeSettlements(balances: MemberBalance[]): OptimizedSettlement[] {
  const creditors = balances
    .filter((balance) => balance.balanceMinor > 0)
    .map((balance) => ({ memberId: balance.memberId, amountMinor: balance.balanceMinor }))
    .sort((a, b) => b.amountMinor - a.amountMinor)
  const debtors = balances
    .filter((balance) => balance.balanceMinor < 0)
    .map((balance) => ({ memberId: balance.memberId, amountMinor: Math.abs(balance.balanceMinor) }))
    .sort((a, b) => b.amountMinor - a.amountMinor)

  const settlements: OptimizedSettlement[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]!
    const creditor = creditors[creditorIndex]!
    const amountMinor = Math.min(debtor.amountMinor, creditor.amountMinor)

    if (amountMinor > 0) {
      settlements.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amountMinor
      })
    }

    debtor.amountMinor -= amountMinor
    creditor.amountMinor -= amountMinor

    if (debtor.amountMinor === 0) debtorIndex += 1
    if (creditor.amountMinor === 0) creditorIndex += 1
  }

  return settlements
}

export function getParticipantTotal(expense: Pick<Expense, 'participants'>) {
  return expense.participants.reduce((total, participant) => total + participant.shareMinor, 0)
}
