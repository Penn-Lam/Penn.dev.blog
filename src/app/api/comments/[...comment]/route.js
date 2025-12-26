import { NextComment } from '@fuma-comment/server/next'

import { auth, storage } from '@/lib/comment.config'

export const runtime = 'nodejs'

export const { GET, DELETE, PATCH, POST } = NextComment({
  auth,
  storage
})
