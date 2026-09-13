'use client'

import { useEffect, useState } from 'react'
import { Link as AriaLink } from 'react-aria-components'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { UrlFavicon } from '@/components/url-favicon'
import { addDefaultProtocol, getUrlHostname } from '@/lib/url'
import { cx } from '@/utils/cx'

const metadataCache = new Map()

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
      <span className="text-text-secondary min-w-0 truncate">{siteName}</span>
      <span className="text-text-primary min-w-0 truncate font-medium underline decoration-current/35 underline-offset-3">
        {children || hostname}
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
