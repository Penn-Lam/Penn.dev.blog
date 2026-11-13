import artItems from '@/data/shelves/art.json'
import musicItems from '@/data/shelves/music.json'
import { withReferral } from '@/lib/shelf-items'

/**
 * [INPUT]: 依赖 @/data/shelves/art.json 与 music.json（条目）；依赖 @/lib/shelf-items 的 withReferral；封面文件在 public/shelves/<slug>/
 * [OUTPUT]: 对外提供 LOCAL_SHELF_COLLECTIONS（收藏夹列表用的条目）、getLocalShelfItems（按 slug 取陈列条目）
 * [POS]: lib/ 的本地陈列数据。Art 和 Music 不再从 Raindrop 同步：条目写在 JSON 里，封面放在 public 里，改动随代码提交发布。
 *        它们仍然出现在 /bookmarks 的收藏夹列表里，地址还是 /bookmarks/art 和 /bookmarks/music。
 *        新增条目：在对应 JSON 加一条 { id, title, url, cover, width, height }，封面存成 public/shelves/<slug>/<id>.webp；没有封面时 cover 写 null。
 *        唱片可以再加 audio（音源），有 audio 的唱片能拖到 Music 页顶部的唱机上播放。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const LOCAL_SHELVES = [
  { slug: 'art', title: 'Art', shelfKind: 'gallery', items: artItems },
  { slug: 'music', title: 'Music', shelfKind: 'records', items: musicItems }
]

// 形状对齐 Raindrop 的收藏夹（_id、slug、title、count），多一个 shelfKind 表示它是本地陈列
export const LOCAL_SHELF_COLLECTIONS = LOCAL_SHELVES.map((shelf) => ({
  _id: `local-${shelf.slug}`,
  slug: shelf.slug,
  title: shelf.title,
  count: shelf.items.length,
  shelfKind: shelf.shelfKind
}))

/**
 * @param {string} slug
 * @returns {Array<object> | null} 陈列条目；slug 不是本地陈列时为 null
 */
export function getLocalShelfItems(slug) {
  const shelf = LOCAL_SHELVES.find((item) => item.slug === slug)

  if (!shelf) return null

  return shelf.items.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.artist ?? '',
    cover: item.cover ?? null,
    fallbackCover: null,
    href: item.url ? withReferral(item.url) : null,
    width: item.width,
    height: item.height,
    // 只有唱片用：能放到唱机上播放的音源，写法见 components/vinyl-player/CLAUDE.md
    audio: item.audio ?? null
  }))
}
