'use client'

import { ArrowUpRightIcon, AtSignIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'

import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/utils 的 cn 函数
 * [OUTPUT]: 对外提供 NavigationLink 组件，带微交互的导航链接
 * [POS]: components/ 导航系统的核心链接组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 动画优化:
// 1. 悬停时添加涟漪效果
// 2. 活跃状态平滑过渡
// 3. 快捷键指示器渐入动画
// 4. 使用 GPU 加速的 transform/opacity
// ==========================================================================

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
        className="group relative flex items-center justify-between gap-2 overflow-hidden rounded-lg p-2 transition-colors duration-200 hover:bg-gray-200"
      >
        {/* 涟漪效果背景 */}
        <span className="absolute inset-0 scale-0 rounded-lg bg-gray-300/50 transition-transform duration-300 group-hover:scale-100" />
        <span className="relative inline-flex items-center gap-2 font-medium">
          {iconCmp} {label}
        </span>
        <ArrowUpRightIcon
          size={16}
          className="relative transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
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
        'group relative flex items-center justify-between rounded-lg p-2 transition-all duration-200',
        isActive ? 'bg-black text-white shadow-sm' : 'hover:bg-gray-200'
      )}
    >
      {/* 活跃状态涟漪 */}
      {isActive && <span className="animate-pulse-light absolute inset-0 rounded-lg bg-gray-800" />}
      <span className="relative flex items-center gap-2">
        {iconCmp}
        <span className={cn('font-medium', isActive && 'text-white')}>{label}</span>
      </span>
      {shortcutNumber && (
        <span
          className={cn(
            'relative hidden size-5 place-content-center rounded-sm border text-xs font-medium transition-all duration-200 lg:grid',
            'border-gray-200 bg-gray-100 text-gray-500',
            'group-hover:scale-110 group-hover:border-gray-300 group-hover:bg-gray-200',
            isActive && 'border-gray-600 bg-gray-700 text-gray-200 group-hover:border-gray-600'
          )}
          title={`Shortcut key: ${shortcutNumber}`}
        >
          {/* 数字渐入动画 */}
          <span className="animate-in fade-in slide-in-from-left-1 duration-300">{shortcutNumber}</span>
        </span>
      )}
    </Link>
  )
})
NavigationLink.displayName = 'NavigationLink'
