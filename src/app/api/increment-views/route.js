import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase/private'
import { isDevelopment } from '@/lib/utils'

export async function POST(request) {
  const enableDev = process.env.ENABLE_VIEW_COUNT_IN_DEV === 'true'
  if (isDevelopment && !enableDev) return NextResponse.json({ error: 'Not available in development' }, { status: 400 })

  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })

  try {
    const { error: rpcError } = await supabase.rpc('increment_view_count', { page_slug: slug })
    if (rpcError) {
      console.error('RPC error incrementing view count:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }
    return NextResponse.json({ message: `View count incremented successfully for slug: ${slug}` }, { status: 200 })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
