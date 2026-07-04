import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import type { Database as DatabaseType } from 'better-sqlite3'

import { registerRoutes } from './routes.js'

export interface ServerOptions {
  db: DatabaseType
  logger?: boolean
  publicDir?: string | null
}

export function createServer({ db, logger = true, publicDir = null }: ServerOptions) {
  const app = Fastify({ logger })

  registerRoutes(app, { db })

  if (publicDir) {
    app.register(fastifyStatic, {
      root: publicDir,
      prefix: '/',
      wildcard: false
    })

    app.setNotFoundHandler((request, reply) => {
      if (request.raw.url?.startsWith('/api')) {
        reply.code(404).send({ error: 'Not found.' })
        return
      }

      reply.sendFile('index.html')
    })
  }

  return app
}
