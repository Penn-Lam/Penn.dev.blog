import NextLink from 'next/link'

import { isExternalLink } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/utils 的 isExternalLink 函数
 * [OUTPUT]: 对外提供 Link 组件，自动处理外部链接和内部链接
 * [POS]: components/ 核心链接组件，替代原生 a 标签
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * 生成外部链接的辅助文本（国际化友好）
 * @param {string} href - 链接地址
 * @returns {string} 屏幕阅读器友好的提示文本
 */
function getExternalLinkText(href) {
  try {
    const url = new URL(href, window.location.origin)
    const hostname = url.hostname
    return `, opens ${hostname}`
  } catch {
    return ', opens external page'
  }
}

export const Link = ({ href = '#', children, ...rest }) => {
  const isExternal = isExternalLink(href)
  if (isExternal) {
    return (
      <a
        href={href + '?ref=pennlam.com'}
        target="_blank"
        rel="noopener noreferrer"
        className="link break-words"
        aria-label={typeof children === 'string' ? `${children}${getExternalLinkText(href)}` : undefined}
        {...rest}
      >
        {children}
        {/* 视觉指示器 - 使用 CSS 伪元素 */}
        <span className="after:content-['_↗'] after:ml-0.5 after:align-super after:text-xs after:text-gray-400" aria-hidden="true" />
      </a>
    )
  }

  return <NextLink href={href} className="link" {...rest} />
}
