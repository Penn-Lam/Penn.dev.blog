/**
 * [INPUT]: 依赖 LLMS_TEXT 的 agent 使用指南
 * [OUTPUT]: 对外提供 /llms.txt 纯文本机器入口
 * [POS]: App Router 的 AI agent 发现文件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { LLMS_TEXT } from '@/lib/llms'

export function GET() {
  return new Response(LLMS_TEXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
