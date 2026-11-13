import 'server-only'

import { mapWereadShelf } from '@/lib/weread-shelf'

/**
 * [INPUT]: 依赖环境变量 WEREAD_API_KEY（服务端变量，格式 wrk-xxxx）；依赖微信读书 Agent API Gateway 的 /shelf/sync 接口；依赖 @/lib/weread-shelf 的 mapWereadShelf
 * [OUTPUT]: 对外提供 getWereadShelf（拉取书架，返回书架条目数组或 null）
 * [POS]: lib/ 的微信读书数据源，只负责请求。/bookmarks/books 的书架优先用它，lib/bookshelf.js 负责在它和 Raindrop 之间取舍。
 *        未配置密钥或接口失败时返回 null，由调用方回退。回包整形和私密书过滤在 weread-shelf.js。
 *        接口约定来自官方 Skill（github.com/Tencent/WeChatReading，skills/SKILL.md 与 skills/shelf.md）。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const WEREAD_GATEWAY_URL = 'https://i.weread.qq.com/api/agent/gateway'

// 网关要求每次请求带上 Skill 版本号；回包出现 upgrade_info 时把这里改成它要求的版本
const WEREAD_SKILL_VERSION = '1.0.5'

const REVALIDATE_SECONDS = 60 * 60

export async function getWereadShelf() {
  const apiKey = process.env.WEREAD_API_KEY

  if (!apiKey) return null

  try {
    const response = await fetch(WEREAD_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ api_name: '/shelf/sync', skill_version: WEREAD_SKILL_VERSION }),
      cache: 'force-cache',
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const payload = await response.json()

    if (payload.errcode) throw new Error(`WeRead errcode ${payload.errcode}`)

    if (payload.upgrade_info) console.info('WeRead gateway asks for a newer skill_version:', payload.upgrade_info)

    return mapWereadShelf(payload)
  } catch (error) {
    console.error(`Failed to fetch WeRead shelf: ${error.message}`)

    return null
  }
}
