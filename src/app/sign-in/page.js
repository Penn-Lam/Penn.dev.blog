'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { authClient } from '@/lib/auth-client'

const ERROR_MESSAGES = {
  github: 'GitHub sign-in failed. Check BETTER_AUTH_URL and your GitHub OAuth callback settings.'
}

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get('callback') || '/'
  const providerError = searchParams.get('error')
  const [error, setError] = useState(
    providerError ? ERROR_MESSAGES[providerError] || 'Unable to sign in with GitHub.' : null
  )

  useEffect(() => {
    if (providerError) {
      setError(ERROR_MESSAGES[providerError] || 'Unable to sign in with GitHub.')
      return
    }

    const signIn = async () => {
      try {
        const errorParams = new URLSearchParams({
          error: 'github',
          callback: callbackURL
        })
        const response = await authClient.signIn.social({
          provider: 'github',
          callbackURL,
          errorCallbackURL: `/sign-in?${errorParams.toString()}`,
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
  }, [callbackURL, providerError])

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="border-border-button-default bg-background-primary-default rounded-3xl border p-8 text-center shadow-sm">
        <h1 className="text-title-1-semibold text-text-primary">{error ? 'Unable to sign in' : 'Signing you in…'}</h1>
        <p className="text-body-regular text-text-secondary mt-2">
          {error ? 'Review your auth configuration and try again.' : 'Redirecting to GitHub to continue.'}
        </p>
        {error ? <p className="text-body-regular text-text-error-primary mt-4">{error}</p> : null}
      </div>
    </div>
  )
}
