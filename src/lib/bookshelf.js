import 'server-only'

import { getAllBookmarkItems } from '@/lib/raindrop'
import { raindropToShelfItem } from '@/lib/shelf-items'
import { getWereadShelf } from '@/lib/weread'

/**
 * [INPUT]: 依赖 @/lib/weread 的 getWereadShelf；依赖 @/lib/raindrop 的 getAllBookmarkItems；依赖 @/lib/shelf-items 的 raindropToShelfItem
 * [OUTPUT]: 对外提供 getBookshelfBooks
 * [POS]: lib/ 的书架数据入口。/bookmarks/books 只调它，不直接碰两个上游。
 *        书架以微信读书为准。未配置 WEREAD_API_KEY、接口失败或书架为空时，回退到 Raindrop 的 books 收藏夹，页面不会因此变空。
 *        微信读书稳定后删掉回退：去掉 collectionId 参数和 Raindrop 分支。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * @param {number} collectionId Raindrop 的 books 收藏夹 id，仅回退时使用
 * @returns {Promise<Array<object> | null>} 书架条目数组；两个上游都失败时为 null
 */
export async function getBookshelfBooks(collectionId) {
  const wereadBooks = await getWereadShelf()

  if (wereadBooks?.length) return wereadBooks

  const raindropItems = await getAllBookmarkItems(collectionId)

  return raindropItems ? raindropItems.map(raindropToShelfItem) : null
}
