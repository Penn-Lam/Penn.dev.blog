/**
 * [INPUT]: 依赖 formSchema 验证、isbot 检测、rate-limit 限流、lark API
 * [OUTPUT]: 对外提供 POST handler，接收书签提交并写入飞书多维表格
 * [POS]: api/submit-bookmark 的路由处理，书签提交的服务端入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import ip from '@arcjet/ip'
import { isbot } from 'isbot'
import { NextResponse } from 'next/server'

import { formSchema } from '@/components/submit-bookmark/utils'
import { createBitableRecord, getLarkTenantToken } from '@/lib/lark'
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 600 * 1000,
  uniqueTokenPerInterval: 500
})

export async function POST(req) {
  const json = await req.json()
  const data = await formSchema.safeParse(json)
  if (!data.success) {
    const { error } = data
    return NextResponse.json({ error }, { status: 400 })
  }

  if (isbot(req.headers.get('User-Agent'))) {
    return NextResponse.json({ error: 'Bots are not allowed.' }, { status: 403 })
  }

  const clientIp = ip(req, req.headers) || '127.0.0.1'

  try {
    await limiter.check(5, clientIp)
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  try {
    const { url, email, type } = data.data
    const token = await getLarkTenantToken()
    const res = await createBitableRecord(token, {
      URL: url,
      Email: email,
      Date: Date.now(),
      Type: type || 'Other'
    })
    return NextResponse.json({ res })
  } catch (error) {
    console.info(error)
    return NextResponse.json({ error: 'Error submitting bookmark.' }, { status: 500 })
  }
}
