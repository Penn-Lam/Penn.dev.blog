'use client'

import { CldImage } from 'next-cloudinary'

/**
 * [INPUT]: 依赖 next-cloudinary 的 CldImage 组件
 * [OUTPUT]: 对外提供 HardwareList 组件，展示硬件设备列表
 * [POS]: components/workspace/ 的硬件展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const CATEGORY_CONFIG = {
  laptop: { icon: '💻', label: 'Computer', color: 'bg-blue-50 text-blue-600' },
  display: { icon: '🖥️', label: 'Display', color: 'bg-purple-50 text-purple-600' },
  keyboard: { icon: '⌨️', label: 'Keyboard', color: 'bg-emerald-50 text-emerald-600' },
  mouse: { icon: '🖱️', label: 'Mouse', color: 'bg-orange-50 text-orange-600' },
  audio: { icon: '🎧', label: 'Audio', color: 'bg-pink-50 text-pink-600' },
  lighting: { icon: '💡', label: 'Lighting', color: 'bg-amber-50 text-amber-600' },
  xr: { icon: '👓', label: 'XR Device', color: 'bg-indigo-50 text-indigo-600' }
}

export function HardwareList({ items }) {
  return (
    <div className="space-y-10">
      {/* Desk Setup Photo */}
      <div className="border-separator-border bg-background-primary-default overflow-hidden rounded-2xl border p-2">
        <div className="bg-background-secondary-default relative aspect-[16/10] w-full overflow-hidden rounded-xl">
          <CldImage
            src="IMG_0282_kitech"
            alt="My Desk Setup"
            width={1200}
            height={750}
            quality="auto"
            format="auto"
            sizes="(max-width: 768px) 100vw, 800px"
            className="h-full w-full object-cover"
            crop="fill"
            gravity="center"
          />
        </div>
      </div>

      {/* Hardware Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const config = CATEGORY_CONFIG[item.category] || {
            icon: '⚙️',
            label: 'Device',
            color: 'bg-background-secondary-default text-text-secondary'
          }
          return (
            <div
              key={index}
              className="border-separator-border bg-background-primary-default hover:border-border-button-hover hover:shadow-card group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${config.color}`}>
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-body-semibold text-text-primary mb-1">{item.name}</h3>
                <p className="text-body-regular text-text-secondary mb-1">{item.detail}</p>
                <p className="text-caption-1-regular text-text-tertiary">{item.role}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
