import { CommandIcon } from '@/components/icons'
import { MenuContent } from '@/components/menu-content'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'

/**
 * [INPUT]: 依赖 @/components/ui/drawer 的 vaul 抽屉、@/components/menu-content 的菜单内容
 * [OUTPUT]: 对外提供 MobileDrawer 组件，移动端导航抽屉
 * [POS]: components/ 导航系统的一部分，支持触屏设备
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          aria-controls="mobile-menu-content"
          className="text-foreground-icon-primary hover:bg-background-primary-hover focus-visible:ring-border-focus-ring inline-flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2"
        >
          <CommandIcon size={16} aria-hidden="true" />
        </button>
      </DrawerTrigger>
      <DrawerContent
        id="mobile-menu-content"
        className="border-border-button-default bg-background-primary-default h-4/5 rounded-t-3xl"
        aria-label="Navigation menu"
      >
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
