'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { authClient } from '@/lib/auth-client'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackURL = useMemo(() => searchParams.get('callback') || '/', [searchParams])
  const [error, setError] = useState(null)

  useEffect(() => {
    const signIn = async () => {
      try {
        const response = await authClient.signIn.social({
          provider: 'github',
          callbackURL,
          errorCallbackURL: '/sign-in?error=github',
          disableRedirect: true
        })
        if (response?.error) {
          throw response.error
        }
        if (response?.data?.url) {
          window.location.href = response.data.url
        }
      } catch (err) {
        setError(err?.message || 'Unable to sign in with GitHub.')
      }
    }

    signIn()
  }, [callbackURL])

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Signing you in…</h1>
        <p className="mt-2 text-sm text-gray-500">Redirecting to GitHub to continue.</p>
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  )
}
