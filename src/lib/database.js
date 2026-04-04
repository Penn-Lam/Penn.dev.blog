import 'server-only'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
const usesTransactionPooler = connectionString?.includes(':6543') || connectionString?.includes('pooler.supabase.com')

if (!connectionString) {
  throw new Error('Missing env var SUPABASE_DB_URL or DATABASE_URL')
}

const client = postgres(connectionString, {
  prepare: usesTransactionPooler ? false : undefined
})

export const db = drizzle(client)
export default db
