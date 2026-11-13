import { DesktopIcon, DeviceMobileIcon, EyeglassesIcon, KeyboardIcon, LaptopIcon, MouseIcon } from '@/components/icons'

/**
 * [INPUT]: 依赖 @/components/icons 的设备图标；接收 src/data/workspace/hardware.json 的条目数组
 * [OUTPUT]: 对外提供 HardwareList 组件
 * [POS]: components/workspace 的设备清单。/workspace 页面在桌面电脑主视觉下方调用它。每行一台设备：图标、名称、用途、规格。
 *        设备类别到图标的映射只在这里维护；hardware.json 新增类别时在 CATEGORY_ICONS 补一行。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const CATEGORY_ICONS = {
  laptop: LaptopIcon,
  desktop: DesktopIcon,
  phone: DeviceMobileIcon,
  keyboard: KeyboardIcon,
  mouse: MouseIcon,
  xr: EyeglassesIcon
}

export function HardwareList({ items }) {
  return (
    <ul className="divide-separator-border border-border-button-default bg-background-primary-default divide-y overflow-hidden rounded-3xl border">
      {items.map((item) => {
        const Icon = CATEGORY_ICONS[item.category] || DesktopIcon

        return (
          <li key={item.name} className="flex items-center gap-4 px-5 py-4">
            <Icon className="text-foreground-icon-tertiary size-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <h3 className="text-body-semibold text-text-primary">{item.name}</h3>
              <p className="text-body-2-regular text-text-secondary">{item.role}</p>
            </div>
            <span className="text-caption-1-regular text-text-tertiary shrink-0 text-right font-mono">
              {item.detail}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
