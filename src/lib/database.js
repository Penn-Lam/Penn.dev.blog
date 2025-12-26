import 'server-only'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Missing env var SUPABASE_DB_URL or DATABASE_URL')
}

const client = postgres(connectionString)

export const db = drizzle(client)
export default db
