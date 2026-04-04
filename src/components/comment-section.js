'use client'

import { Comments } from '@fuma-comment/react'

export function CommentSection({ page, className }) {
  return (
    <section className={className}>
      <h2 className="text-lg font-medium text-gray-900">Comments</h2>
      <div className="mt-6">
        <Comments
          page={page}
          auth={{
            type: 'api',
            signIn: () => {
              const params = new URLSearchParams({
                callback: window.location.href
              })
              window.location.href = `/sign-in?${params.toString()}`
            }
          }}
        />
      </div>
    </section>
  )
}
