import { createBetterAuthAdapter } from '@fuma-comment/server/adapters/better-auth'
import { createDrizzleAdapter } from '@fuma-comment/server/adapters/drizzle'

import { auth as betterAuth } from '@/lib/auth'
import { db } from '@/lib/database'
import { comments, rates, roles, user } from '@/lib/schema'

export const auth = createBetterAuthAdapter(betterAuth)

export const storage = createDrizzleAdapter({
  db,
  auth: 'better-auth',
  schemas: {
    comments,
    rates,
    roles,
    user
  }
})
