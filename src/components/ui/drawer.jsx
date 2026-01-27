'use client'

import { memo } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 vaul 的 Drawer 组件
 * [OUTPUT]: 对外提供 Drawer 组件，带平滑滑入动画
 * [POS]: components/ui 的底部抽屉组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 抽屉动画优化:
// 1. 背板添加 backdrop-blur
// 2. 抽屉内容带圆角和阴影
// 3. 拖动手柄样式优化
// ==========================================================================

const Drawer = memo(({ shouldScaleBackground = true, ...props }) => {
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      autoFocus={true} // https://github.com/emilkowalski/vaul/issues/517#issuecomment-2571619213
      {...props}
    />
  )
})
Drawer.displayName = 'Drawer'

const DrawerTrigger = memo(DrawerPrimitive.Trigger)

const DrawerPortal = memo(DrawerPrimitive.Portal)

const DrawerClose = memo(DrawerPrimitive.Close)

const DrawerOverlay = memo(({ className, ...props }) => {
  return (
    <DrawerPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity', className)}
      {...props}
    />
  )
})
DrawerOverlay.displayName = 'DrawerOverlay'

const DrawerContent = memo(({ className, children, ...props }) => {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl border border-gray-200 bg-white shadow-xl',
          className
        )}
        {...props}
      >
        {/* 拖动手柄 - 视觉反馈 */}
        <div className="mx-auto mt-3 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-200 transition-transform duration-200 hover:bg-gray-300" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = 'DrawerContent'

function DrawerHeader({ className, ...props }) {
  return <div className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props} />
}

function DrawerFooter({ className, ...props }) {
  return <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
}

const DrawerTitle = memo(({ className, ...props }) => {
  return (
    <DrawerPrimitive.Title className={cn('text-lg leading-none font-semibold tracking-tight', className)} {...props} />
  )
})
DrawerTitle.displayName = 'DrawerTitle'

const DrawerDescription = memo(({ className, ...props }) => {
  return <DrawerPrimitive.Description className={cn('text-sm/snug text-gray-500', className)} {...props} />
})
DrawerDescription.displayName = 'DrawerDescription'

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger
}
