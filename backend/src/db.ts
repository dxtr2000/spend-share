import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Database as DatabaseType } from 'better-sqlite3'

export const MEMBER_COLORS = ['#6C5CE7', '#E85D04', '#00A86B', '#1D9BF0', '#C77DFF', '#FF006E']

const SCHEMA = /* sql */ `
  CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    currency    TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id           TEXT PRIMARY KEY,
    event_id     TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    color        TEXT NOT NULL,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id              TEXT PRIMARY KEY,
    event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    amount_minor    INTEGER NOT NULL,
    currency        TEXT NOT NULL,
    paid_by_member_id TEXT NOT NULL REFERENCES members(id),
    category        TEXT NOT NULL,
    date            TEXT NOT NULL,
    notes           TEXT,
    fx_rate_to_default REAL,
    created_at      TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expense_participants (
    expense_id  TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    share_minor INTEGER NOT NULL,
    PRIMARY KEY (expense_id, member_id)
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id            TEXT PRIMARY KEY,
    event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    from_member_id TEXT NOT NULL REFERENCES members(id),
    to_member_id   TEXT NOT NULL REFERENCES members(id),
    amount_minor  INTEGER NOT NULL,
    currency      TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );
`

export function openDatabase(dataDir: string): DatabaseType {
  mkdirSync(dataDir, { recursive: true })
  const db = new Database(join(dataDir, 'spend-share.sqlite'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  return db
}

export function now(): string {
  return new Date().toISOString()
}