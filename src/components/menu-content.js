/**
 * [INPUT]: 依赖 NavigationLink、VinylPlayer、常量 LINKS/PROFILES
 * [OUTPUT]: 对外提供 MenuContent 组件
 * [POS]: components 的主侧边栏内容组件，包含导航、社交链接、黑胶播放器
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import Link from 'next/link'

import { NavigationLink } from '@/components/navigation-link'
import { VinylPlayer } from '@/components/vinyl-player'
import { LINKS, PROFILES } from '@/lib/constants'

export const MenuContent = () => (
  <div className="flex w-full flex-col text-sm">
    <div className="flex flex-col gap-4">
      <Link href="/" className="link-card inline-flex items-center gap-2 p-2">
        <img
          src="/assets/me.avif"
          alt="Penn"
          width={40}
          height={40}
          loading="lazy"
          className="rounded-full border shadow-xs"
          // eslint-disable-next-line react/no-unknown-property
          nopin="nopin"
        />
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight">Penn</span>
          <span className="text-gray-600">Technical Founder</span>
        </div>
      </Link>
      <div className="flex flex-col gap-1">
        {LINKS.map((link, linkIndex) => (
          <NavigationLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            shortcutNumber={linkIndex + 1}
          />
        ))}
        <VinylPlayer />
      </div>
    </div>
    <hr />
    <div className="flex flex-col gap-2 text-sm">
      <span className="px-2 text-xs leading-relaxed font-medium text-gray-600">Online</span>
      <div className="flex flex-col gap-1">
        {Object.values(PROFILES).map((profile) => (
          <NavigationLink key={profile.url} href={profile.url} label={profile.title} icon={profile.icon} />
        ))}
      </div>
    </div>
  </div>
)
