import type { Database as DatabaseType } from 'better-sqlite3'
import type {
  AllEventsCurrencyTotal,
  AllEventsMemberRanking,
  AllEventsStatsEvent,
  AllEventsStatsResponse,
  CurrencyCode,
  Expense,
  Event,
  EventSummary,
  GroupMember,
  RecordedSettlement,
  WorkspaceResponse
} from '@spend-share/types'

interface EventRow {
  id: string
  name: string
  currency: string
  created_at: string
}

interface MemberRow {
  id: string
  event_id: string
  display_name: string
  color: string
  created_at: string
}

interface ExpenseRow {
  id: string
  event_id: string
  title: string
  amount_minor: number
  currency: string
  paid_by_member_id: string
  category: string
  date: string
  notes: string | null
  fx_rate_to_default: number | null
  created_at: string
}

interface SettlementRow {
  id: string
  event_id: string
  from_member_id: string
  to_member_id: string
  amount_minor: number
  currency: string
  created_at: string
}

interface ParticipantRow {
  member_id: string
  share_minor: number
}

function mapEvent(row: EventRow | undefined): Event | null {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    defaultCurrency: row.currency as Event['defaultCurrency'],
    createdAt: row.created_at
  }
}

function mapMember(row: MemberRow): GroupMember {
  return {
    id: row.id,
    eventId: row.event_id,
    displayName: row.display_name,
    color: row.color
  }
}

function mapExpense(db: DatabaseType, row: ExpenseRow): Expense {
  const participants = db
    .prepare('SELECT member_id, share_minor FROM expense_participants WHERE expense_id = ?')
    .all(row.id) as ParticipantRow[]
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    amountMinor: row.amount_minor,
    currency: row.currency as Expense['currency'],
    paidByMemberId: row.paid_by_member_id,
    date: row.date,
    notes: row.notes ?? undefined,
    category: row.category,
    fxRateToDefault: row.fx_rate_to_default ?? undefined,
    participants: participants.map((participant) => ({
      memberId: participant.member_id,
      shareMinor: participant.share_minor
    }))
  }
}

function mapSettlement(row: SettlementRow): RecordedSettlement {
  return {
    id: row.id,
    eventId: row.event_id,
    fromMemberId: row.from_member_id,
    toMemberId: row.to_member_id,
    amountMinor: row.amount_minor,
    currency: row.currency as RecordedSettlement['currency'],
    createdAt: row.created_at
  }
}

export function readEvents(db: DatabaseType): Event[] {
  return (db.prepare('SELECT * FROM events ORDER BY created_at DESC').all() as EventRow[]).map((row) => mapEvent(row)!)
}

interface EventSummaryRow extends EventRow {
  member_count: number
}

interface ExpenseTotalRow {
  amount_minor: number
  currency: CurrencyCode
  fx_rate_to_default: number | null
}

interface EventStatsRow extends EventSummaryRow {
  expense_count: number
}

const currencyFractions: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  HUF: 0,
  GBP: 2
}

function convertMinorCurrency(amountMinor: number, from: CurrencyCode, to: CurrencyCode, rate: number) {
  if (from === to) return amountMinor
  const amountMajor = amountMinor / 10 ** currencyFractions[from]
  return Math.round(amountMajor * rate * 10 ** currencyFractions[to])
}

function readEventTotalMinor(db: DatabaseType, eventId: string, defaultCurrency: CurrencyCode) {
  const rows = db
    .prepare('SELECT amount_minor, currency, fx_rate_to_default FROM expenses WHERE event_id = ?')
    .all(eventId) as ExpenseTotalRow[]

  return rows.reduce((total, row) => {
    const currency = row.currency
    if (currency === defaultCurrency) return total + row.amount_minor
    if (!row.fx_rate_to_default) return total + row.amount_minor
    return total + convertMinorCurrency(row.amount_minor, currency, defaultCurrency, row.fx_rate_to_default)
  }, 0)
}

export function readEventSummaries(db: DatabaseType): EventSummary[] {
  const rows = db
    .prepare(
      `SELECT e.*,
         (SELECT COUNT(*) FROM members m WHERE m.event_id = e.id) AS member_count
       FROM events e
       ORDER BY e.created_at DESC`
    )
    .all() as EventSummaryRow[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    defaultCurrency: row.currency as EventSummary['defaultCurrency'],
    createdAt: row.created_at,
    memberCount: row.member_count,
    expenseTotalMinor: readEventTotalMinor(db, row.id, row.currency as EventSummary['defaultCurrency'])
  }))
}

function readEventStats(db: DatabaseType): AllEventsStatsEvent[] {
  const rows = db
    .prepare(
      `SELECT e.*,
         (SELECT COUNT(*) FROM members m WHERE m.event_id = e.id) AS member_count,
         (SELECT COUNT(*) FROM expenses x WHERE x.event_id = e.id) AS expense_count
       FROM events e
       ORDER BY e.created_at DESC`
    )
    .all() as EventStatsRow[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    defaultCurrency: row.currency as EventSummary['defaultCurrency'],
    createdAt: row.created_at,
    memberCount: row.member_count,
    expenseCount: row.expense_count,
    expenseTotalMinor: readEventTotalMinor(db, row.id, row.currency as EventSummary['defaultCurrency'])
  }))
}

export function readAllEventsStats(db: DatabaseType): AllEventsStatsResponse {
  const events = readEventStats(db)
  const eventById = new Map(events.map((event) => [event.id, event]))
  const currencyTotals = new Map<CurrencyCode, number>()
  const memberRankings = new Map<string, AllEventsMemberRanking>()

  for (const event of events) {
    currencyTotals.set(event.defaultCurrency, (currencyTotals.get(event.defaultCurrency) ?? 0) + event.expenseTotalMinor)

    const members = db
      .prepare('SELECT * FROM members WHERE event_id = ? ORDER BY created_at')
      .all(event.id) as MemberRow[]

    for (const member of members) {
      memberRankings.set(`${event.id}:${member.id}`, {
        id: `${event.id}:${member.id}`,
        memberId: member.id,
        eventId: event.id,
        eventName: event.name,
        displayName: member.display_name,
        color: member.color,
        currency: event.defaultCurrency,
        paidMinor: 0,
        shareMinor: 0,
        netMinor: 0
      })
    }
  }

  const expenseRows = db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').all() as ExpenseRow[]

  for (const expense of expenseRows) {
    const event = eventById.get(expense.event_id)
    if (!event) continue

    const currency = expense.currency as CurrencyCode
    const amountMinor = convertMinorCurrency(
      expense.amount_minor,
      currency,
      event.defaultCurrency,
      expense.fx_rate_to_default ?? 1
    )
    const payer = memberRankings.get(`${event.id}:${expense.paid_by_member_id}`)
    if (payer) {
      payer.paidMinor += amountMinor
      payer.netMinor += amountMinor
    }

    const participants = db
      .prepare('SELECT member_id, share_minor FROM expense_participants WHERE expense_id = ?')
      .all(expense.id) as ParticipantRow[]

    for (const participant of participants) {
      const member = memberRankings.get(`${event.id}:${participant.member_id}`)
      if (!member) continue
      const shareMinor = convertMinorCurrency(
        participant.share_minor,
        currency,
        event.defaultCurrency,
        expense.fx_rate_to_default ?? 1
      )
      member.shareMinor += shareMinor
      member.netMinor -= shareMinor
    }
  }

  const totals = {
    eventCount: events.length,
    memberCount: events.reduce((total, event) => total + event.memberCount, 0),
    expenseCount: events.reduce((total, event) => total + event.expenseCount, 0),
    eventsWithSpend: events.filter((event) => event.expenseTotalMinor > 0).length
  }

  const totalsByCurrency: AllEventsCurrencyTotal[] = [...currencyTotals.entries()]
    .map(([currency, amountMinor]) => ({ currency, amountMinor }))
    .sort((a, b) => b.amountMinor - a.amountMinor)

  return {
    events,
    currencyTotals: totalsByCurrency,
    memberRankings: [...memberRankings.values()],
    totals
  }
}

export function readWorkspace(db: DatabaseType, eventId?: string): WorkspaceResponse {
  const events = readEvents(db)

  if (!eventId) {
    return { event: null, events, members: [], expenses: [], settlements: [] }
  }

  const event = mapEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as EventRow | undefined)
  if (!event) {
    return { event: null, events, members: [], expenses: [], settlements: [] }
  }

  const members = (db
    .prepare('SELECT * FROM members WHERE event_id = ? ORDER BY created_at')
    .all(event.id) as MemberRow[]).map(mapMember)

  const expenses = (db
    .prepare('SELECT * FROM expenses WHERE event_id = ? ORDER BY date DESC, created_at DESC')
    .all(event.id) as ExpenseRow[]).map((row) => mapExpense(db, row))

  const settlements = (db
    .prepare('SELECT * FROM settlements WHERE event_id = ? ORDER BY created_at DESC')
    .all(event.id) as SettlementRow[]).map(mapSettlement)

  return { event, events, members, expenses, settlements }
}

export function findEventById(db: DatabaseType, eventId: string): Event | null {
  return mapEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as EventRow | undefined)
}

export function countMembers(db: DatabaseType, eventId: string): number {
  return (db.prepare('SELECT COUNT(*) AS count FROM members WHERE event_id = ?').get(eventId) as { count: number }).count
}
