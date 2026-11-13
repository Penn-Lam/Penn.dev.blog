/**
 * [INPUT]: 无外部依赖；接收 Raindrop 的收藏条目
 * [OUTPUT]: 对外提供 raindropToShelfItem、withReferral
 * [POS]: lib/ 的陈列条目整形。components/shelves 的三种陈列只认一种条目形状：{ id, title, subtitle, cover, fallbackCover, href }。
 *        Raindrop 条目在这里转成它；微信读书条目在 weread-shelf.js 转成它。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 外链带上来源标记，对方站点的统计里能看到流量来自本站
export function withReferral(link) {
  try {
    const url = new URL(link)

    url.searchParams.set('ref', 'pennlam.com')

    return url.toString()
  } catch {
    return link
  }
}

export function raindropToShelfItem(item) {
  return {
    id: String(item._id),
    title: item.title,
    subtitle: '',
    // 站点走 https，http 封面会被浏览器拦截
    cover: item.cover ? item.cover.replace(/^http:\/\//, 'https://') : null,
    fallbackCover: null,
    href: item.link ? withReferral(item.link) : null
  }
}
