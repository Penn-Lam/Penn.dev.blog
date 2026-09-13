import NextLink from 'next/link'

import { NotionMentionLink } from '@/components/notion-mention-link'
import { isExternalLink } from '@/lib/utils'
import { cx } from '@/utils/cx'

/**
 * [INPUT]: 依赖 @/lib/utils 的 isExternalLink 函数
 * [OUTPUT]: 对外提供 Link 组件，自动处理外部链接和内部链接
 * [POS]: components/ 核心链接组件，替代原生 a 标签
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const Link = ({ href = '#', children, className, ...rest }) => {
  const isExternal = isExternalLink(href)
  if (isExternal) {
    return (
      <NotionMentionLink url={href} className={className} {...rest}>
        {children}
      </NotionMentionLink>
    )
  }

  return (
    <NextLink
      href={href}
      className={cx('link text-accent-600 active:text-accent-800 underline-offset-3 hover:underline', className)}
      {...rest}
    />
  )
}
