import { isbot } from 'isbot'
import { NextResponse } from 'next/server'

import { appendNegotiationVary, preferredRepresentation } from '@/lib/content-negotiation'

export function proxy(request, event) {
  const { pathname } = request.nextUrl
  const writingSlug = pathname.match(/^\/writing\/([^/]+)$/)?.[1]
  const userAgent = request.headers.get('user-agent')
  const isBotRequest = !userAgent || isbot(userAgent)

  async function sendAnalytics() {
    const URL = `${request.nextUrl.origin}/api/increment-views`

    try {
      const res = await fetch(`${URL}?slug=${writingSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      if (res.status !== 200) console.error('Failed to send analytics', res)
    } catch (error) {
      console.error('Error sending analytics', error)
    }
  }

  /**
   * The `event.waitUntil` function is the real magic here.
   * It enables the response to proceed without waiting for the completion of `sendAnalytics()`.
   * This ensures that the user experience remains uninterrupted and free from unnecessary delays.
   */
  if (writingSlug && !isBotRequest) event.waitUntil(sendAnalytics())

  const accept = request.headers.get('accept')
  const representation = preferredRepresentation(accept)

  if (representation === 'text/markdown') {
    const url = request.nextUrl.clone()
    url.pathname = `/api/markdown${pathname}`
    const response = NextResponse.rewrite(url)

    appendNegotiationVary(response.headers)

    return response
  }

  if (!representation) {
    const response = new NextResponse('Not Acceptable\n\nAvailable: text/html, text/markdown\n', {
      status: 406,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })

    appendNegotiationVary(response.headers)

    return response
  }

  const response = NextResponse.next()

  appendNegotiationVary(response.headers)

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api/|_next/|_vercel/|.*(?:opengraph-image)(?:/|$)|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}
