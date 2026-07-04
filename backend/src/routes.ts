import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'node:crypto'
import type { Database as DatabaseType } from 'better-sqlite3'
import type { CreateExpensePayload, OptimizedSettlement, UpdateEventPayload, UpdateExpensePayload } from '@spend-share/types'

import { MEMBER_COLORS, now } from './db.js'
import { getFxRate } from './rates.js'
import {
  countMembers,
  findEventById,
  readAllEventsStats,
  readEventSummaries,
  readWorkspace
} from './workspace.js'

interface RouteContext {
  db: DatabaseType
}

function badRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send({ error: message })
}

function notFound(reply: FastifyReply, message: string) {
  return reply.code(404).send({ error: message })
}

function bodyOf(request: FastifyRequest): Record<string, unknown> {
  return (request.body ?? {}) as Record<string, unknown>
}

function parseString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function parseCurrency(value: unknown): 'USD' | 'EUR' | 'HUF' | 'GBP' {
  return parseString(value, 'USD') as 'USD' | 'EUR' | 'HUF' | 'GBP'
}

function parseArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function parseExpensePayload(body: Record<string, unknown>, defaultCurrency: 'USD' | 'EUR' | 'HUF' | 'GBP') {
  const payload = body as Partial<CreateExpensePayload | UpdateExpensePayload>
  const title = parseString(payload.title).trim() || 'Expense'
  const currency = parseCurrency(payload.currency ?? defaultCurrency)
  const category = parseString(payload.category, 'Food & drink')
  const date = parseString(payload.date, new Date().toISOString().slice(0, 10))
  const paidByMemberId = parseString(payload.paidByMemberId)
  const amountMinor = Number(payload.amountMinor ?? 0)
  const notes = payload.notes ? parseString(payload.notes) : null
  const participants = (parseArray(payload.participants) as Array<{ memberId?: string; shareMinor?: number }>)
    .filter((participant) => participant.memberId)

  return { amountMinor, category, currency, date, notes, paidByMemberId, participants, title }
}

export function registerRoutes(app: FastifyInstance, { db }: RouteContext): void {
  app.get('/api/health', async () => ({ ok: true }))

  app.get('/api/events', async () => ({ events: readEventSummaries(db) }))

  app.get('/api/stats', async () => readAllEventsStats(db))

  app.get('/api/workspace', async (request) =>
    readWorkspace(db, parseString((request.query as Record<string, string>).eventId))
  )

  app.get('/api/events/:eventId', async (request, reply) => {
    const workspace = readWorkspace(db, (request.params as { eventId: string }).eventId)
    if (!workspace.event) return notFound(reply, 'Event not found.')
    return workspace
  })

  app.post('/api/events', async (request) => {
    const body = bodyOf(request)
    const id = randomUUID()
    const createdAt = now()
    const name = parseString(body.name, 'Event').trim() || 'Event'
    const currency = parseCurrency(body.currency)
    const memberNames = (parseArray(body.memberNames) as unknown[])
      .map((entry) => parseString(entry).trim())
      .filter(Boolean)

    const create = db.transaction(() => {
      db.prepare('INSERT INTO events (id, name, currency, created_at) VALUES (?, ?, ?, ?)').run(
        id,
        name,
        currency,
        createdAt
      )
      memberNames.forEach((memberName, index) => {
        db.prepare('INSERT INTO members (id, event_id, display_name, color, created_at) VALUES (?, ?, ?, ?, ?)').run(
          randomUUID(),
          id,
          memberName,
          MEMBER_COLORS[index % MEMBER_COLORS.length]!,
          createdAt
        )
      })
    })
    create()

    return readWorkspace(db, id)
  })

  app.patch('/api/events/:eventId', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    const payload = bodyOf(request) as Partial<UpdateEventPayload>
    const name = parseString(payload.name, event.name).trim() || event.name
    const currency = parseCurrency(payload.currency ?? event.defaultCurrency)

    const expenseRows = db
      .prepare('SELECT id, currency FROM expenses WHERE event_id = ?')
      .all(event.id) as Array<{ id: string; currency: 'USD' | 'EUR' | 'HUF' | 'GBP' }>

    const rates = new Map<string, number | null>()
    if (currency !== event.defaultCurrency) {
      for (const row of expenseRows) {
        rates.set(row.id, (await getFxRate(row.currency, currency)) ?? null)
      }
    }

    const update = db.transaction(() => {
      db.prepare('UPDATE events SET name = ?, currency = ? WHERE id = ?').run(name, currency, event.id)
      if (currency !== event.defaultCurrency) {
        for (const row of expenseRows) {
          db.prepare('UPDATE expenses SET fx_rate_to_default = ? WHERE id = ?').run(rates.get(row.id) ?? null, row.id)
        }
        db.prepare('UPDATE settlements SET currency = ? WHERE event_id = ?').run(currency, event.id)
      }
    })
    update()

    return readWorkspace(db, event.id)
  })

  app.delete('/api/events/:eventId', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    db.prepare('DELETE FROM events WHERE id = ?').run(event.id)
    return readWorkspace(db)
  })

  app.post('/api/events/:eventId/members', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    const body = bodyOf(request)
    const name = parseString(body.name).trim()
    if (!name) return badRequest(reply, 'Member name is required.')

    const index = countMembers(db, event.id)
    db.prepare('INSERT INTO members (id, event_id, display_name, color, created_at) VALUES (?, ?, ?, ?, ?)').run(
      randomUUID(),
      event.id,
      name,
      MEMBER_COLORS[index % MEMBER_COLORS.length]!,
      now()
    )

    return readWorkspace(db, event.id)
  })

  app.post('/api/events/:eventId/expenses', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    const body = bodyOf(request)
    const id = randomUUID()
    const createdAt = now()
    const { amountMinor, category, currency, date, notes, paidByMemberId, participants, title } =
      parseExpensePayload(body, event.defaultCurrency)

    const fxRateToDefault = await getFxRate(currency, event.defaultCurrency)

    const create = db.transaction(() => {
      db.prepare(
        `INSERT INTO expenses
          (id, event_id, title, amount_minor, currency, paid_by_member_id, category, date, notes, fx_rate_to_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, event.id, title, amountMinor, currency, paidByMemberId, category, date, notes, fxRateToDefault ?? null, createdAt)

      participants.forEach((participant) => {
        db.prepare('INSERT INTO expense_participants (expense_id, member_id, share_minor) VALUES (?, ?, ?)').run(
          id,
          participant.memberId,
          Number(participant.shareMinor ?? 0)
        )
      })
    })
    create()

    return readWorkspace(db, event.id)
  })

  app.patch('/api/events/:eventId/expenses/:expenseId', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    const expenseId = (request.params as { expenseId: string }).expenseId
    const existing = db.prepare('SELECT id FROM expenses WHERE id = ? AND event_id = ?').get(expenseId, event.id)
    if (!existing) return notFound(reply, 'Expense not found.')

    const { amountMinor, category, currency, date, notes, paidByMemberId, participants, title } =
      parseExpensePayload(bodyOf(request), event.defaultCurrency)
    const fxRateToDefault = await getFxRate(currency, event.defaultCurrency)

    const update = db.transaction(() => {
      db.prepare(
        `UPDATE expenses
         SET title = ?, amount_minor = ?, currency = ?, paid_by_member_id = ?, category = ?, date = ?, notes = ?, fx_rate_to_default = ?
         WHERE id = ? AND event_id = ?`
      ).run(title, amountMinor, currency, paidByMemberId, category, date, notes, fxRateToDefault ?? null, expenseId, event.id)

      db.prepare('DELETE FROM expense_participants WHERE expense_id = ?').run(expenseId)
      participants.forEach((participant) => {
        db.prepare('INSERT INTO expense_participants (expense_id, member_id, share_minor) VALUES (?, ?, ?)').run(
          expenseId,
          participant.memberId,
          Number(participant.shareMinor ?? 0)
        )
      })
    })
    update()

    return readWorkspace(db, event.id)
  })

  app.delete('/api/events/:eventId/expenses/:expenseId', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    const expenseId = (request.params as { expenseId: string }).expenseId
    const result = db.prepare('DELETE FROM expenses WHERE id = ? AND event_id = ?').run(expenseId, event.id)
    if (result.changes === 0) return notFound(reply, 'Expense not found.')

    return readWorkspace(db, event.id)
  })

  app.post('/api/events/:eventId/settlements', async (request, reply) => {
    const event = findEventById(db, (request.params as { eventId: string }).eventId)
    if (!event) return notFound(reply, 'Event not found.')

    const payload = bodyOf(request) as Partial<OptimizedSettlement>
    db.prepare(
      `INSERT INTO settlements
        (id, event_id, from_member_id, to_member_id, amount_minor, currency, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      randomUUID(),
      event.id,
      parseString(payload.fromMemberId),
      parseString(payload.toMemberId),
      Number(payload.amountMinor ?? 0),
      event.defaultCurrency,
      now()
    )

    return readWorkspace(db, event.id)
  })

  app.delete('/api/workspace', async () => {
    db.prepare('DELETE FROM events').run()
    return readWorkspace(db)
  })
}
