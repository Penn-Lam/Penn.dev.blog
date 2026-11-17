import { NextResponse } from 'next/server'

import { getPlaylistAudios } from '@/lib/netease'

/**
 * [INPUT]: 依赖 @/lib/netease 的 getPlaylistAudios
 * [OUTPUT]: 对外提供 GET /api/playlist：站点网易云歌单的全部曲目，APlayer 认的格式（name、artist、url、cover）
 * [POS]: 唱机播放器的歌单来源。<meting-js> 的 api 属性指向这里，替掉 Meting 公共接口，为的是换掉音频地址（原因见 lib/netease-records.js）。
 *        只吐站点自己的歌单，不接受歌单 id 参数，不做成通用代理。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const CACHE_SECONDS = 60 * 60

export async function GET() {
  const audios = await getPlaylistAudios()

  if (!audios) return NextResponse.json({ message: 'Playlist unavailable' }, { status: 502 })

  return NextResponse.json(audios, {
    headers: { 'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}` }
  })
}
