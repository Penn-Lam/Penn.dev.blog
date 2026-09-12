'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cloneElement, useMemo } from 'react'

import { Collapsible, Sidebar } from '@/components/application/dashboard/dashboard-sidebar'
import { NavigationLink } from '@/components/navigation-link'
import { useDialogState } from '@/components/quick-post-button'
import { VinylPlayer } from '@/components/vinyl-player'
import { useKeyPress } from '@/hooks/useKeyPress'
import { LINKS, PROFILES } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 BoardUI Sidebar、NavigationLink、VinylPlayer、LINKS/PROFILES 常量
 * [OUTPUT]: 对外提供 SiteSidebar 组件，桌面端左侧导航（lg+）
 * [POS]: app/layout.js 的全局侧边栏，替换原 SideMenu + MenuContent 组合
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const keyCodePathnameMapping = {
  Digit1: '/',
  Digit2: '/writing',
  Digit3: '/journey',
  Digit4: '/stack',
  Digit5: '/workspace',
  Digit6: '/visual',
  Digit7: '/bookmarks',
  Digit8: '/friends'
}

function SidebarIdentity({ collapsed }) {
  return (
    <div className={cn('flex items-center gap-2', collapsed && 'gap-0')}>
      <img
        src="/assets/me.avif"
        alt="Penn"
        width={32}
        height={32}
        loading="lazy"
        className="size-8 shrink-0 rounded-full border shadow-xs"
        // eslint-disable-next-line react/no-unknown-property
        nopin="nopin"
      />
      <Collapsible collapsed={collapsed} className="flex-col items-start gap-0">
        <span className="text-body-medium text-text-primary whitespace-nowrap">Penn</span>
        <span className="text-caption-1-regular text-text-secondary whitespace-nowrap">Technical Founder</span>
      </Collapsible>
    </div>
  )
}

export const SiteSidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { isQuickPostOpen } = useDialogState()

  function onKeyPress(event) {
    const targetPathname = keyCodePathnameMapping[event.code]
    if (targetPathname && targetPathname !== pathname) router.push(targetPathname)
  }

  useKeyPress(onKeyPress, Object.keys(keyCodePathnameMapping), isQuickPostOpen)

  const items = useMemo(
    () =>
      LINKS.map((link) => ({
        key: link.href === '/' ? 'home' : link.href.slice(1),
        label: link.label,
        href: link.href,
        icon: ({ className, ...rest }) => cloneElement(link.icon, { className, ...rest })
      })),
    []
  )

  const selected = pathname === '/' ? 'home' : (pathname?.split('/')[1] ?? 'home')

  return (
    <div className="hidden h-screen w-[284px] shrink-0 flex-col gap-3 p-3 lg:flex">
      <Sidebar
        items={items}
        selected={selected}
        header={(collapsed) => <SidebarIdentity collapsed={collapsed} />}
        footer={(collapsed) =>
          collapsed ? null : (
            <div className="flex flex-col gap-1 px-0.5">
              <VinylPlayer />
              <div className="flex flex-col gap-1">
                <span className="text-caption-1-medium text-text-secondary px-1">Online</span>
                {Object.values(PROFILES).map((profile) => (
                  <NavigationLink key={profile.url} href={profile.url} label={profile.title} icon={profile.icon} />
                ))}
              </div>
            </div>
          )
        }
      />
    </div>
  )
}
