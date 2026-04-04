import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

import { db } from '@/lib/database'
import * as schema from '@/lib/schema'

function normalizeUrl(url) {
  return url?.trim().replace(/\/$/, '') || undefined
}

const siteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
const betterAuthUrl = normalizeUrl(process.env.BETTER_AUTH_URL)
const vercelUrl = normalizeUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
const baseURL = process.env.NODE_ENV === 'production' ? siteUrl || betterAuthUrl || vercelUrl : undefined

const socialProviders = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  }
}

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.user
    }
  }),
  socialProviders,
  trustedOrigins: (request) =>
    Array.from(
      new Set([siteUrl, betterAuthUrl, vercelUrl, request ? new URL(request.url).origin : undefined].filter(Boolean))
    ),
  plugins: [nextCookies()]
})
