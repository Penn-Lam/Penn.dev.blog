import { NextResponse } from 'next/server'

import { addDefaultProtocol, getFaviconUrl, getUrlHostname, isValidWebsiteUrl } from '@/lib/url'

const USER_AGENT = 'OpenAI File Downloader, XaiImageApiFetch/1.0'

export async function GET(request) {
  const value = new URL(request.url).searchParams.get('url')

  if (!value || value.length > 2048 || !isValidWebsiteUrl(value)) {
    return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 })
  }

  const url = addDefaultProtocol(value)
  const endpoint = new URL('https://api.microlink.io/')
  endpoint.searchParams.set('url', url)

  try {
    const headers = { 'User-Agent': USER_AGENT }

    if (process.env.MICROLINK_API_KEY) headers['x-api-key'] = process.env.MICROLINK_API_KEY

    const response = await fetch(endpoint, {
      headers,
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(15000)
    })

    const payload = await response.json()

    if (!response.ok || payload.status !== 'success') {
      return NextResponse.json({ error: 'Preview unavailable.' }, { status: 502 })
    }

    const data = payload.data
    const resolvedUrl = data.url || url
    const domain = getUrlHostname(resolvedUrl)

    return NextResponse.json(
      {
        url: resolvedUrl,
        title: data.title || domain,
        description: data.description || '',
        siteName: data.publisher || domain,
        domain,
        image: data.image?.url,
        favicon: data.logo?.url || getFaviconUrl(resolvedUrl)
      },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    )
  } catch {
    return NextResponse.json({ error: 'Preview unavailable.' }, { status: 502 })
  }
}
