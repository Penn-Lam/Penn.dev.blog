import Image from 'next/image'
import { Fragment, memo } from 'react'

import { RichText } from '@/components/contentful/rich-text'
import { Link } from '@/components/link'
import { splitTextByUrls } from '@/lib/url'

/**
 * [INPUT]: 依赖 @/components/contentful/rich-text 的 RichText（开启 autoLink）；依赖 @/components/link 的 Link；依赖 @/lib/url 的 splitTextByUrls；依赖 next/image
 * [OUTPUT]: 对外提供 JourneyCard 组件，展示旅程卡片
 * [POS]: /journey 时间线的单条卡片。Logbook 的标题是纯文本、描述是富文本，两处里的网址都渲染成 NotionMentionLink 外链卡片。
 *        外链卡片去掉上下内边距，高度不超过正文行高，避免撑高时间线的行。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const JOURNEY_LINK_CLASSNAME = 'py-0'

// Logbook 标题是 Contentful Short text，没有超链接节点，只能在渲染时切出网址
function renderTitle(title) {
  return splitTextByUrls(title).map((segment, index) => (
    <Fragment key={index}>
      {segment.type === 'url' ? (
        <Link href={segment.href} className={JOURNEY_LINK_CLASSNAME}>
          {segment.value}
        </Link>
      ) : (
        segment.value
      )}
    </Fragment>
  ))
}

// ==========================================================================
// 性能优化:
// 1. 使用 Next.js Image 替代原生 img
// 2. 自动格式转换 (AVIF/WebP)
// 3. 响应式图片尺寸 (sizes 属性)
// 4. 更积极的懒加载
// ==========================================================================

export const JourneyCard = memo(({ title, description, image, index }) => {
  // 图片响应式 sizes - 根据容器宽度加载合适的图片
  const imageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  return (
    <div className="word-break-word flex flex-col">
      <span className="mb-px font-semibold tracking-tight">{renderTitle(title)}</span>
      {description?.json && (
        <div className="rich-text-journey text-body-regular">
          <RichText content={description} autoLink linkClassName={JOURNEY_LINK_CLASSNAME} />
        </div>
      )}
      {image?.url && (
        <div className="bg-background-primary-default mt-2.5 overflow-hidden rounded-xl">
          <Image
            src={image.url}
            alt={image.title || image.description || ''}
            width={image.width || 800}
            height={image.height || 600}
            // 性能优化: 首屏图片优先加载，其他懒加载
            priority={index < 1}
            loading={index < 1 ? 'eager' : 'lazy'}
            // 性能优化: 响应式图片尺寸
            sizes={imageSizes}
            // 性能优化: 自动格式选择
            quality={80}
            className="animate-reveal object-cover"
            nopin="nopin"
          />
        </div>
      )}
    </div>
  )
})

JourneyCard.displayName = 'JourneyCard'
