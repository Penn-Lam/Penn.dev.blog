'use client'

import { useState } from 'react'

import { Link02Icon } from '@/components/icons'
import { getFaviconUrl } from '@/lib/url'
import { cx } from '@/utils/cx'

export function UrlFavicon({ value, className }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const src = getFaviconUrl(value)

  if (!src || src === failedSrc) return <Link02Icon className={cx('size-5 shrink-0', className)} aria-hidden />

  return (
    <img src={src} alt="" className={cx('size-5 shrink-0 rounded-sm', className)} onError={() => setFailedSrc(src)} />
  )
}
