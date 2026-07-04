import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { openDatabase } from './db.js'
import { createServer } from './server.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR ?? join(__dirname, '..', '..', 'data')
const publicDir = process.env.PUBLIC_DIR ?? null
const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'

const db = openDatabase(dataDir)
const app = createServer({ db, publicDir })

try {
  await app.listen({ host, port })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
