/**
 * [INPUT]: 无外部依赖；接收微信读书 /shelf/sync 接口的回包
 * [OUTPUT]: 对外提供 mapWereadShelf（回包转书架条目）、upgradeWereadCover（封面换大图地址）
 * [POS]: lib/ 的微信读书回包整形，全是纯函数，单独成文件以便不经网络做单元测试。lib/weread.js 调用它。
 *        私密阅读的书（secret 为 1）在这里过滤掉，不进入任何页面。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * 书架回包里的封面是小图（文件名以 s_ 开头）。同一路径下 t4_ 是约 45KB 的大图。
 * 文件名不符合这个规则时原样返回。
 */
export function upgradeWereadCover(cover) {
  return cover ? cover.replace(/\/s_([^/]+)$/, '/t4_$1') : cover
}

const isWebLink = (value) => (value || '').startsWith('https://')

/**
 * @param {{ books?: Array<object> }} payload /shelf/sync 的回包
 * @returns {Array<{ id: string, title: string, subtitle: string, cover: string | null, fallbackCover: string | null, href: string | null }>}
 */
export function mapWereadShelf(payload) {
  const books = payload?.books ?? []

  return books
    .filter((book) => book.secret !== 1 && book.title)
    .toSorted((a, b) => (b.readUpdateTime ?? 0) - (a.readUpdateTime ?? 0))
    .map((book) => ({
      id: `weread-${book.bookId}`,
      title: book.title,
      subtitle: book.author ?? '',
      cover: upgradeWereadCover(book.cover) || null,
      fallbackCover: book.cover || null,
      // readerLink、deepLink 可能是 App 协议链接，只有 https 链接才能放到网页上
      href: [book.readerLink, book.deepLink].find(isWebLink) ?? null
    }))
}
