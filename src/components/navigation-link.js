'use client'

import { ArrowUpRightIcon, AtSignIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cloneElement, isValidElement, memo } from 'react'

import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/utils 的 cn 函数
 * [OUTPUT]: 对外提供 NavigationLink 组件
 * [POS]: components/ 导航系统的核心链接组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const rowIconClass = 'size-5 shrink-0 text-foreground-icon-secondary'

function RowIcon({ icon }) {
  if (isValidElement(icon)) {
    return cloneElement(icon, { className: rowIconClass, 'aria-hidden': true })
  }
  return <AtSignIcon className={rowIconClass} aria-hidden />
}

export const NavigationLink = memo(({ href, label, icon, shortcutNumber }) => {
  const pathname = usePathname()

  const isInternal = href.startsWith('/')
  if (!isInternal) {
    return (
      <a
        key={href}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-background-secondary-hover rounded-2lg flex items-center justify-between gap-2 p-2"
      >
        <span className="flex min-w-0 items-center gap-2">
          <RowIcon icon={icon} />
          <span className="text-body-medium text-text-secondary">{label}</span>
        </span>
        <ArrowUpRightIcon size={16} className="text-foreground-icon-tertiary shrink-0" aria-hidden />
      </a>
    )
  }

  let isActive = false
  if (pathname?.length > 0) {
    const splittedPathname = pathname.split('/')
    const currentPathname = splittedPathname[1] ?? ''
    isActive = currentPathname === href.split('/')[1]
  }

  return (
    <Link
      key={href}
      href={href}
      className={cn(
        'rounded-2lg flex items-center justify-between p-2',
        isActive ? 'bg-text-primary text-text-white' : 'hover:bg-background-secondary-hover'
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <RowIcon icon={icon} />
        <span className={cn('text-body-medium', !isActive && 'text-text-secondary', isActive && 'text-text-white')}>
          {label}
        </span>
      </span>
      {shortcutNumber && (
        <span
          className={cn(
            'border-border-button-default bg-background-secondary-default text-caption-1-medium text-text-secondary hidden size-5 place-content-center rounded-sm border lg:grid',
            isActive && 'bg-kbd-background text-text-primary border-transparent'
          )}
          title={`Shortcut key: ${shortcutNumber}`}
        >
          {shortcutNumber}
        </span>
      )}
    </Link>
  )
})
NavigationLink.displayName = 'NavigationLink'
