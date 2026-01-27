'use client'

import { ArrowLeftIcon, RadioIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Balancer from 'react-wrap-balancer'

import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'

const MobileDrawer = dynamic(() => import('@/components/mobile-drawer').then((mod) => mod.MobileDrawer))
const SubmitBookmarkDrawer = dynamic(
  () => import('@/components/submit-bookmark/drawer').then((mod) => mod.SubmitBookmarkDrawer),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)
import { MOBILE_SCROLL_THRESHOLD, SCROLL_AREA_ID } from '@/lib/constants'

/**
 * [INPUT]: 依赖 @/lib/constants 的滚动阈值配置
 * [OUTPUT]: 对外提供 FloatingHeader 组件，移动端浮动标题
 * [POS]: components/ 导航系统的一部分
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 性能优化:
// 1. 使用 requestAnimationFrame 节流滚动事件（60fps 目标）
// 2. 简化滚动计算公式
// 3. 使用 CSS will-change 提示 GPU 加速
// 4. 移除不必要的 useMemo 组件封装
// ==========================================================================

// 滚动节流辅助函数
function throttle(callback, limit = 16) {
  let waiting = false
  return function (...args) {
    if (!waiting) {
      callback.apply(this, args)
      waiting = true
      setTimeout(() => {
        waiting = false
      }, limit)
    }
  }
}

export const FloatingHeader = memo(({ scrollTitle, title, goBackLink, bookmarks, currentBookmark, children }) => {
  // 使用 ref 避免不必要的重渲染
  const transformRef = useRef({ translateY: 0, opacity: scrollTitle ? 0 : 1 })
  const [, forceUpdate] = useState(0)
  const pathname = usePathname()
  const isWritingIndexPage = pathname === '/writing'
  const isWritingPath = pathname.startsWith('/writing')
  const isBookmarksIndexPage = pathname === '/bookmarks'
  const isBookmarkPath = pathname.startsWith('/bookmarks')

  // 滚动处理函数 - 使用节流
  const handleScroll = useCallback((scrollY) => {
    // 简化计算：translateY 随滚动递减
    const newTranslateY = Math.max(100 - scrollY, 0)

    // 简化的透明度计算：当滚动超过阈值时逐渐显示
    const newOpacity = scrollY > MOBILE_SCROLL_THRESHOLD ? 1 : scrollY / MOBILE_SCROLL_THRESHOLD

    transformRef.current = { translateY: newTranslateY, opacity: newOpacity }
    forceUpdate((n) => n + 1)
  }, [])

  const throttledHandleScroll = useMemo(() => throttle(handleScroll, 16), [handleScroll])

  useEffect(() => {
    if (!scrollTitle) return

    const scrollAreaElem = document.querySelector(`#${SCROLL_AREA_ID}`)
    if (!scrollAreaElem) return

    // 使用节流的滚动处理
    const onScroll = (e) => throttledHandleScroll(e.target.scrollTop)

    scrollAreaElem.addEventListener('scroll', onScroll, { passive: true })

    return () => scrollAreaElem.removeEventListener('scroll', onScroll)
  }, [scrollTitle, throttledHandleScroll])

  // 标题渲染 - 使用 CSS will-change 提示 GPU
  const titleElement = scrollTitle ? (
    <span
      className="will-change-transform-opacity line-clamp-2 font-semibold tracking-tight"
      style={{
        transform: `translateY(${transformRef.current.translateY}%)`,
        opacity: transformRef.current.opacity
      }}
    >
      {scrollTitle}
    </span>
  ) : null

  return (
    <header className="sticky inset-x-0 top-0 z-10 mx-auto flex h-12 w-full shrink-0 items-center overflow-hidden border-b bg-white text-sm font-medium lg:hidden">
      <div className="flex size-full items-center px-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-1">
            {goBackLink ? (
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href={goBackLink} title="Go back">
                  <ArrowLeftIcon size={16} />
                </Link>
              </Button>
            ) : (
              <MobileDrawer />
            )}
            <div className="flex flex-1 items-center justify-between">
              {titleElement}
              {/* Balancer 仅在 title 存在时渲染 */}
              {title && (
                <Balancer ratio={0.35}>
                  <span className="line-clamp-2 font-semibold tracking-tight">{title}</span>
                </Balancer>
              )}
              <div className="flex items-center gap-2">
                {(isWritingIndexPage || isBookmarksIndexPage) && (
                  <Button variant="outline" size="xs" asChild>
                    <a
                      href={isWritingIndexPage ? '/writing.xml' : '/bookmarks.xml'}
                      title="RSS feed"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RadioIcon size={16} className="mr-2" />
                      RSS feed
                    </a>
                  </Button>
                )}
                {isBookmarkPath && <SubmitBookmarkDrawer bookmarks={bookmarks} currentBookmark={currentBookmark} />}
              </div>
            </div>
          </div>
          {/* This is a hack to show writing views with framer motion reveal effect */}
          {scrollTitle && isWritingPath && <div className="flex min-w-[50px] justify-end">{children}</div>}
        </div>
      </div>
    </header>
  )
})
FloatingHeader.displayName = 'FloatingHeader'
