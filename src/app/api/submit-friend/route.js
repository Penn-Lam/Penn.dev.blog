/**
 * [INPUT]: 依赖 zod 验证、isbot 检测、rate-limit 限流、lark API
 * [OUTPUT]: 对外提供 POST handler，接收友链提交并写入飞书多维表格
 * [POS]: api/submit-friend 的路由处理，友链提交的服务端入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import ip from '@arcjet/ip'
import { isbot } from 'isbot'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createBitableRecord, getLarkTenantToken } from '@/lib/lark'
import rateLimit from '@/lib/rate-limit'

const formSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  avatar: z.string().url().or(z.literal('')).optional(),
  github: z.string().optional().or(z.literal('')),
  signature: z.string().optional().or(z.literal('')),
  email: z.string().email().or(z.literal('')).optional()
})

const limiter = rateLimit({
  interval: 600 * 1000,
  uniqueTokenPerInterval: 500
})

export async function POST(req) {
  const json = await req.json()
  const data = await formSchema.safeParse(json)
  if (!data.success) {
    return NextResponse.json({ error: data.error }, { status: 400 })
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
    const { name, url, avatar, github, signature, email } = data.data
    const token = await getLarkTenantToken()
    const res = await createBitableRecord(
      token,
      {
        Name: name,
        URL: { link: url, text: url },
        Avatar: avatar ? { link: avatar, text: avatar } : '',
        GitHub: github || '',
        Signature: signature || '',
        Email: email || '',
        Date: Date.now()
      },
      { tableId: process.env.LARK_FRIENDS_TABLE_ID }
    )
    return NextResponse.json({ res })
  } catch (error) {
    console.info(error)
    return NextResponse.json({ error: 'Error submitting friend link.' }, { status: 500 })
  }
}
