export type CurrencyCode = 'USD' | 'EUR' | 'HUF' | 'GBP'

export interface Event {
  id: string
  name: string
  defaultCurrency: CurrencyCode
  createdAt: string
}

export interface GroupMember {
  id: string
  eventId: string
  displayName: string
  color: string
}

export interface ExpenseParticipant {
  memberId: string
  shareMinor: number
}

export interface Expense {
  id: string
  eventId: string
  title: string
  amountMinor: number
  currency: CurrencyCode
  paidByMemberId: string
  date: string
  notes?: string
  category?: string
  participants: ExpenseParticipant[]
  /** Exchange rate to the event's default currency, captured at creation time.
   *  rateToDefault = amountInDefaultCurrencyMajor / amountInExpenseCurrencyMajor. */
  fxRateToDefault?: number
}

export interface RecordedSettlement {
  id: string
  eventId: string
  fromMemberId: string
  toMemberId: string
  amountMinor: number
  currency: CurrencyCode
  createdAt: string
}

export interface MemberBalance {
  memberId: string
  balanceMinor: number
}

export interface OptimizedSettlement {
  fromMemberId: string
  toMemberId: string
  amountMinor: number
}

export interface CreateExpensePayload {
  title: string
  amountMinor: number
  currency: CurrencyCode
  paidByMemberId: string
  category?: string
  date: string
  notes?: string
  participants: ExpenseParticipant[]
}

export type UpdateExpensePayload = CreateExpensePayload

export interface CreateEventPayload {
  currency: CurrencyCode
  memberNames: string[]
  name: string
}

export interface UpdateEventPayload {
  currency: CurrencyCode
  name: string
}

export interface EventSummary {
  id: string
  name: string
  defaultCurrency: CurrencyCode
  createdAt: string
  memberCount: number
  expenseTotalMinor: number
}

export interface AllEventsStatsEvent extends EventSummary {
  expenseCount: number
}

export interface AllEventsCurrencyTotal {
  currency: CurrencyCode
  amountMinor: number
}

export interface AllEventsMemberRanking {
  id: string
  memberId: string
  eventId: string
  eventName: string
  displayName: string
  color: string
  currency: CurrencyCode
  paidMinor: number
  shareMinor: number
  netMinor: number
}

export interface AllEventsStatsResponse {
  events: AllEventsStatsEvent[]
  currencyTotals: AllEventsCurrencyTotal[]
  memberRankings: AllEventsMemberRanking[]
  totals: {
    eventCount: number
    memberCount: number
    expenseCount: number
    eventsWithSpend: number
  }
}

export interface WorkspaceResponse {
  event: Event | null
  events: Event[]
  members: GroupMember[]
  expenses: Expense[]
  settlements: RecordedSettlement[]
}
