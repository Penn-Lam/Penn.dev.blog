import { CommandIcon } from 'lucide-react'

import { MenuContent } from '@/components/menu-content'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'

/**
 * [INPUT]: 依赖 @/components/menu-content 的菜单内容
 * [OUTPUT]: 对外提供 MobileDrawer 组件，移动端导航抽屉
 * [POS]: components/ 导航系统的一部分，支持触屏设备
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          aria-controls="mobile-menu-content"
        >
          <CommandIcon size={16} aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent id="mobile-menu-content" className="h-4/5" aria-label="Navigation menu">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Mobile Menu</DrawerTitle>
          <DrawerDescription>Navigation menu for mobile devices</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-4" role="navigation" aria-label="Mobile navigation">
          <MenuContent />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
