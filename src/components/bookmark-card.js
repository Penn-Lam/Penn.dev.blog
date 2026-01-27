import { Link2Icon, Tag } from 'lucide-react'
import dynamic from 'next/dynamic'

const TweetCard = dynamic(() => import('@/components/tweet-card/tweet-card').then((mod) => mod.TweetCard))
import { TWEETS_COLLECTION_IDS } from '@/lib/constants'

/**
 * [INPUT]: 依赖 @/lib/constants 的 TWEETS_COLLECTION_IDS
 * [OUTPUT]: 对外提供 BookmarkCard 组件，展示书签卡片
 * [POS]: components/bookmark 的核心展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * 生成可访问的图片 alt 文本
 * @param {Object} bookmark - 书签对象
 * @returns {string} 描述性 alt 文本
 */
function getImageAlt(bookmark) {
  const { title, domain, excerpt } = bookmark
  if (excerpt) {
    // 使用摘要作为 alt 文本（最多 125 字符以避免过长）
    return `${title} - ${excerpt}`.slice(0, 125)
  }
  return `Cover image for ${title} from ${domain}`
}

/**
 * 生成唯一的内容描述用于屏幕阅读器
 * @param {Object} bookmark - 书签对象
 * @returns {string} 简洁的aria-label
 */
function getAriaLabel(bookmark) {
  const parts = [bookmark.title, `from ${bookmark.domain}`]
  if (bookmark.tags?.length > 0) {
    parts.push(`tagged ${bookmark.tags.join(', ')}`)
  }
  return parts.join(', ')
}

export const BookmarkCard = ({ bookmark, order }) => {
  if (bookmark.link && TWEETS_COLLECTION_IDS.includes(bookmark.collectionId)) {
    const match = bookmark.link.match(/\/status\/(\d+)/) ?? []
    const tweetId = match[1]
    return <TweetCard id={tweetId} />
  }

  // 空状态处理
  if (!bookmark || !bookmark.link) {
    return null
  }

  return (
    <a
      key={bookmark._id}
      className="thumbnail-shadow flex aspect-auto min-w-0 cursor-pointer flex-col gap-4 overflow-hidden rounded-xl bg-white p-4 transition-colors duration-300 hover:bg-gray-100"
      href={`${bookmark.link}?ref=pennlam.com`}
      target="_blank"
      rel="noopener noreferrer"
      data-bookmark-order={order}
      aria-label={getAriaLabel(bookmark)}
    >
      <span className="aspect-1200/630 overflow-hidden rounded-lg">
        <img
          src={bookmark.cover || '/assets/fallback.avif'}
          alt={getImageAlt(bookmark)}
          width={1200}
          height={630}
          loading={order < 2 ? 'eager' : 'lazy'}
          className="animate-reveal aspect-1200/630 rounded-lg border bg-cover bg-center bg-no-repeat object-cover"
          onError={(e) => {
            // 防止无限循环
            e.currentTarget.onerror = null
            e.currentTarget.src = '/assets/fallback.avif'
          }}
          // eslint-disable-next-line react/no-unknown-property
          nopin="nopin"
        />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        {/* 标题：使用 line-clamp 防止溢出 */}
        <h2 className="line-clamp-4 min-w-0 text-lg leading-snug">{bookmark.title}</h2>
        {/* 域名：截断处理 */}
        <span className="line-clamp-1 inline-flex min-w-0 items-center gap-1 text-sm text-gray-500">
          <Link2Icon size={16} aria-hidden="true" />
          <span className="min-w-0 truncate">{bookmark.domain}</span>
        </span>
        {/* 摘要：截断处理 */}
        <span className="line-clamp-6 min-w-0 text-sm">{bookmark.excerpt || bookmark.note}</span>

        {/* Tags - 触摸目标最小尺寸 44x44px */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                aria-label={`Tag: ${tag}`}
              >
                <Tag size={10} className="text-gray-400" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
