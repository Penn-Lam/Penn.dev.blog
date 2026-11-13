'use client'

import { useEffect, useState } from 'react'
import { Link as AriaLink } from 'react-aria-components'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { UrlFavicon } from '@/components/url-favicon'
import { addDefaultProtocol, getUrlHostname, isValidWebsiteUrl } from '@/lib/url'
import { cx } from '@/utils/cx'

/**
 * [INPUT]: 依赖 react-aria-components 的 Link；依赖 @/components/ui/hover-card；依赖 @/components/url-favicon 的 UrlFavicon；依赖 @/lib/url 的 addDefaultProtocol、getUrlHostname、isValidWebsiteUrl；悬停预览请求 /api/notion-mention-link
 * [OUTPUT]: 对外提供 NotionMentionLink 组件
 * [POS]: components/ 的外链芯片：图标、灰色站点名、带下划线的链接文字，悬停出预览卡。Link 组件把所有外链交给它，Stack 清单直接用它。
 *        链接文字本身就是网址时（Journey 里自动识别出的裸网址），只显示一次网址，不再加站点名前缀。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const metadataCache = new Map()

// 链接文字只有一个节点时取它的字符串形式；React 元素会变成 "[object Object]"，过不了后面的网址校验
function getLinkText(children) {
  const nodes = [children].flat()

  return nodes.length === 1 ? String(nodes[0]) : ''
}

const stripUrlDecoration = (value) =>
  value
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')

function PreviewImage({ src, height }) {
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src || src === failedSrc) return null

  return (
    <img
      src={src}
      alt=""
      className="bg-background-tertiary-default block w-full object-cover"
      style={{ height }}
      onError={() => setFailedSrc(src)}
    />
  )
}

function LinkPreview({ href, endpoint, children, hostname, previewHeight }) {
  const cached = metadataCache.get(href)
  const [metadata, setMetadata] = useState(cached)
  const [status, setStatus] = useState(cached ? 'ready' : 'loading')

  useEffect(() => {
    if (metadataCache.has(href)) return

    const controller = new AbortController()
    fetch(`${endpoint}?${new URLSearchParams({ url: href })}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Preview request failed')

        return response.json()
      })
      .then((data) => {
        metadataCache.set(href, data)
        setMetadata(data)
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error')
      })

    return () => controller.abort()
  }, [endpoint, href])

  if (status === 'loading') {
    return (
      <span className="flex flex-col gap-3 p-4">
        <span className="bg-background-tertiary-default animate-pulse" style={{ height: previewHeight }} />
        <span className="bg-background-tertiary-default h-5 w-4/5 animate-pulse rounded" />
        <span className="bg-background-tertiary-default h-4 w-full animate-pulse rounded" />
      </span>
    )
  }

  return (
    <span className="flex flex-col">
      <PreviewImage src={metadata?.image} height={previewHeight} />
      <span className="flex flex-col gap-2 px-5 pt-4 pb-5 text-left">
        <strong className="text-title-3-semibold line-clamp-2">{metadata?.title || children || hostname}</strong>
        {metadata?.description ? (
          <span className="text-body-2-regular text-text-secondary line-clamp-3">{metadata.description}</span>
        ) : status === 'error' ? (
          <span className="text-body-2-regular text-text-secondary">
            Preview unavailable. The link is still safe to open directly.
          </span>
        ) : null}
        <span className="mt-2 flex items-center gap-2">
          {metadata?.favicon ? (
            <img src={metadata.favicon} alt="" className="size-6 shrink-0 rounded" />
          ) : (
            <UrlFavicon value={href} className="size-6" />
          )}
          <span className="text-caption-1-medium text-text-tertiary truncate">
            {metadata?.siteName || metadata?.domain || hostname}
          </span>
        </span>
      </span>
    </span>
  )
}

export function NotionMentionLink({
  url,
  children,
  endpoint = '/api/notion-mention-link',
  openDelay = 180,
  closeDelay = 120,
  previewWidth = 310,
  previewHeight = 140,
  align = 'start',
  showPreview = true,
  previewClassName,
  className,
  ...props
}) {
  const href = addDefaultProtocol(url)
  const hostname = getUrlHostname(href)
  const siteName = hostname?.split('.')[0]

  if (!hostname) return children

  const plainText = getLinkText(children)
  const isUrlText = isValidWebsiteUrl(plainText) && getUrlHostname(plainText) === hostname

  const mention = (
    <AriaLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'text-body-regular hover:bg-background-secondary-hover focus-visible:bg-background-secondary-hover focus-visible:ring-border-focus-ring inline-flex max-w-full items-center gap-1.5 rounded-[5px] px-1 py-0.5 align-middle transition-colors duration-100 outline-none focus-visible:ring-2',
        className
      )}
      {...props}
    >
      <UrlFavicon value={href} className="size-[22px]" />
      {!isUrlText && <span className="text-text-secondary min-w-0 truncate">{siteName}</span>}
      <span className="text-text-primary min-w-0 truncate font-medium underline decoration-current/35 underline-offset-3">
        {isUrlText ? stripUrlDecoration(plainText) : children || hostname}
      </span>
    </AriaLink>
  )

  if (!showPreview) return mention

  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger asChild>{mention}</HoverCardTrigger>
      <HoverCardContent
        align={align}
        side="bottom"
        sideOffset={8}
        style={{ width: previewWidth }}
        className={cx('max-w-[calc(100vw-2rem)] border-0 bg-transparent p-0 shadow-none', previewClassName)}
      >
        <span className="border-border-button-default bg-background-primary-default block overflow-hidden rounded-xl border shadow-xl">
          <LinkPreview href={href} endpoint={endpoint} hostname={hostname} previewHeight={previewHeight}>
            {children}
          </LinkPreview>
        </span>
      </HoverCardContent>
    </HoverCard>
  )
}
