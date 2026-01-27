import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Image from 'next/image'
import { memo } from 'react'

/**
 * [INPUT]: 依赖 contentful rich-text 渲染器和 next/image
 * [OUTPUT]: 对外提供 JourneyCard 组件，展示旅程卡片
 * [POS]: components/journey 的核心卡片组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

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
      <span className="mb-px font-semibold tracking-tight">{title}</span>
      {description?.json && (
        <div className="rich-text-journey text-sm">{documentToReactComponents(description.json)}</div>
      )}
      {image?.url && (
        <div className="mt-2.5 overflow-hidden rounded-xl bg-white">
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
