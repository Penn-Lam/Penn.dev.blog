import { afterEach, expect, spyOn, test } from 'bun:test'
import { NextRequest } from 'next/server'

import { proxy } from './proxy'

const browserUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

let fetchSpy

afterEach(() => {
  fetchSpy?.mockRestore()
})

test('forwards the browser user agent so the counting API does not discard real visits', async () => {
  fetchSpy = spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

  const request = new NextRequest('https://pennlam.com/writing/test-article', {
    headers: { 'user-agent': browserUserAgent }
  })

  const pending = []

  proxy(request, { waitUntil: (promise) => pending.push(promise) })
  await Promise.all(pending)

  expect(pending).toHaveLength(1)
  expect(fetchSpy).toHaveBeenCalledTimes(1)
  const [url, options] = fetchSpy.mock.calls[0]

  expect(url).toBe('https://pennlam.com/api/increment-views?slug=test-article')
  expect(options.method).toBe('POST')
  expect(new Headers(options.headers).get('user-agent')).toBe(browserUserAgent)
})

test.each([null, 'Googlebot/2.1 (+http://www.google.com/bot.html)'])(
  'does not count requests with missing or bot user agent: %s',
  (userAgent) => {
    fetchSpy = spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    const headers = new Headers()

    if (userAgent) headers.set('user-agent', userAgent)
    const request = new NextRequest('https://pennlam.com/writing/test-article', { headers })
    const pending = []

    proxy(request, { waitUntil: (promise) => pending.push(promise) })

    expect(pending).toHaveLength(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  }
)
