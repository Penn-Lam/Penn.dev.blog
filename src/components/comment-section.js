'use client'

import { Comments } from '@fuma-comment/react'

export function CommentSection({ page, className }) {
  return (
    <section className={className}>
      <h2 className="text-title-3-medium text-text-primary">Comments</h2>
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
