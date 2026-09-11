'use client'

import { ArrowUpRightIcon, AtSignIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'

import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/utils 的 cn 函数
 * [OUTPUT]: 对外提供 NavigationLink 组件
 * [POS]: components/ 导航系统的核心链接组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const NavigationLink = memo(({ href, label, icon, shortcutNumber }) => {
  const pathname = usePathname()
  const iconCmp = useMemo(() => icon ?? <AtSignIcon size={16} />, [icon])

  const isInternal = href.startsWith('/')
  if (!isInternal) {
    return (
      <a
        key={href}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-background-secondary-hover flex items-center justify-between gap-2 rounded-lg p-2"
      >
        <span className="text-body-medium inline-flex items-center gap-2">
          {iconCmp} {label}
        </span>
        <ArrowUpRightIcon size={16} />
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
        'group flex items-center justify-between rounded-lg p-2',
        isActive ? 'bg-text-primary text-text-white' : 'hover:bg-background-secondary-hover'
      )}
    >
      <span className="flex items-center gap-2">
        {iconCmp}
        <span className={cn('text-body-medium', isActive && 'text-text-white')}>{label}</span>
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
