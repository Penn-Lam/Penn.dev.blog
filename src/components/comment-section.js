'use client'

import { Comments } from '@fuma-comment/react'

import { authClient } from '@/lib/auth-client'

export function CommentSection({ page, className }) {
  return (
    <section className={className}>
      <h2 className="text-lg font-medium text-gray-900">Comments</h2>
      <div className="mt-6">
        <Comments
          page={page}
          auth={{
            type: 'api',
            signIn: async () => {
              const response = await authClient.signIn.social({
                provider: 'github',
                callbackURL: window.location.href,
                errorCallbackURL: '/sign-in?error=github',
                disableRedirect: true
              })
              if (response?.data?.url) {
                window.location.href = response.data.url
              }
            }
          }}
        />
      </div>
    </section>
  )
}
