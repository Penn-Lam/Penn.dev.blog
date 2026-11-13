import { Bookshelf } from './bookshelf'
import { GalleryWall } from './gallery-wall'
import { RecordShelf } from './record-shelf'

/**
 * [INPUT]: 依赖同目录的 GalleryWall、Bookshelf、RecordShelf；kind 的取值来自 @/lib/local-shelves（本地陈列）与 @/lib/constants 的 BOOKMARK_SHELVES（Raindrop 收藏夹）
 * [OUTPUT]: 对外提供 BookmarkShelf 组件
 * [POS]: components/shelves 的出口。/bookmarks/[slug] 按收藏夹的陈列方式调它，不直接引用三种陈列。
 *        新增一种陈列时：在 SHELVES 加一行，再在上面两处之一登记哪个收藏夹用它。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const SHELVES = {
  gallery: GalleryWall,
  bookshelf: Bookshelf,
  records: RecordShelf
}

export function BookmarkShelf({ kind, items }) {
  const Shelf = SHELVES[kind]

  if (!items?.length) {
    return <p className="text-body-regular text-text-tertiary py-16 text-center">Nothing here yet.</p>
  }

  return <Shelf items={items} />
}
