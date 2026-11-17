import 'server-only'

import { NETEASE_PLAYLIST_ID } from '@/lib/constants'
import { mapPlaylistToAudios, mapPlaylistToRecords } from '@/lib/netease-records'

/**
 * [INPUT]: 依赖 @/lib/constants 的 NETEASE_PLAYLIST_ID；依赖 Meting 公共接口（api.i-meto.com）；依赖 @/lib/netease-records 的 mapPlaylistToRecords、mapPlaylistToAudios
 * [OUTPUT]: 对外提供 getPlaylistRecords（歌单前若干首，转成唱片架条目；失败时为 null）、getPlaylistAudios（整份歌单，转成唱机播放器的曲目；失败时为 null）
 * [POS]: lib/ 的网易云歌单数据源，只负责请求。/bookmarks/music 的唱片架用 getPlaylistRecords：架上的唱片就是歌单里最新加入的那些歌。
 *        唱机的播放器经 /api/playlist 用 getPlaylistAudios。两者出自同一次请求（同一份缓存），所以架上的顺序和播放器歌单的顺序一致。
 *        Meting 接口只用来取歌单的曲目清单，音频地址另换，原因见 netease-records.js。
 *        接口对没有浏览器 User-Agent 的请求会返回人机验证页，所以这里带上一个。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const METING_API_URL = 'https://api.i-meto.com/meting/api'

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

// 歌单有几千首，架上只摆最新加入的这些
const RECORDS_ON_SHELF = 24

const REVALIDATE_SECONDS = 60 * 60

// 歌单的原始曲目清单；失败时为 null
async function fetchPlaylistTracks() {
  const url = `${METING_API_URL}?${new URLSearchParams({ server: 'netease', type: 'playlist', id: NETEASE_PLAYLIST_ID })}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': BROWSER_USER_AGENT },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(20000)
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch NetEase playlist: ${error.message}`)

    return null
  }
}

export async function getPlaylistRecords() {
  const records = mapPlaylistToRecords(await fetchPlaylistTracks(), RECORDS_ON_SHELF)

  return records.length > 0 ? records : null
}

export async function getPlaylistAudios() {
  const audios = mapPlaylistToAudios(await fetchPlaylistTracks())

  return audios.length > 0 ? audios : null
}
