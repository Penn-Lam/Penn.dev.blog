import 'server-only'

import { LOCAL_SHELF_COLLECTIONS } from '@/lib/local-shelves'
import { getBookmarks } from '@/lib/raindrop'

/**
 * [INPUT]: 依赖 @/lib/raindrop 的 getBookmarks（Raindrop 收藏夹）；依赖 @/lib/local-shelves 的 LOCAL_SHELF_COLLECTIONS（本地陈列）
 * [OUTPUT]: 对外提供 getBookmarkCollections
 * [POS]: lib/ 的 /bookmarks 收藏夹列表入口。侧栏、索引页、详情页、OG 图、sitemap、markdown 接口都调它。
 *        列表由两部分拼成：Raindrop 的收藏夹，加上本地陈列（Art、Music）。bookmarks.xml 只发 Raindrop 的条目，仍然直接调 getBookmarks。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export async function getBookmarkCollections() {
  const raindropCollections = await getBookmarks()

  return [...raindropCollections, ...LOCAL_SHELF_COLLECTIONS]
}
