'use client'

import { ArrowUpRightIcon } from 'lucide-react'
import Image from 'next/image'
import { memo } from 'react'

/**
 * [INPUT]: 依赖 next/image 的 Image 组件
 * [OUTPUT]: 对外提供 ToolCard 组件，展示工具卡片
 * [POS]: components/ 的工具展示组件，被 CategorySection 使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 标签颜色映射 - 使用统一的低饱和度风格
const TAG_COLORS = {
  AI: 'bg-slate-100 text-slate-600',
  Prod: 'bg-blue-50 text-blue-600',
  Dev: 'bg-emerald-50 text-emerald-600',
  Notes: 'bg-amber-50 text-amber-600',
  Deploy: 'bg-cyan-50 text-cyan-600',
  Infra: 'bg-gray-100 text-gray-600',
  Framework: 'bg-indigo-50 text-indigo-600',
  CSS: 'bg-rose-50 text-rose-600',
  LLM: 'bg-violet-50 text-violet-600',
  Image: 'bg-teal-50 text-teal-600',
  Design: 'bg-pink-50 text-pink-600',
  Proto: 'bg-orange-50 text-orange-600',
  Productivity: 'bg-lime-50 text-lime-600',
  Launcher: 'bg-sky-50 text-sky-600',
  Music: 'bg-red-50 text-red-600',
  Security: 'bg-stone-100 text-stone-600',
  Git: 'bg-orange-50 text-orange-600',
  'AI IDE': 'bg-purple-50 text-purple-600'
}

export const ToolCard = memo(function ToolCard({ tool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-separator-border bg-background-primary-default hover:border-border-button-hover hover:shadow-card group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300"
    >
      {/* Header: Icon + Name + Arrow */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-background-secondary-default relative flex h-12 w-12 items-center justify-center rounded-xl">
            <Image
              src={`/tools/${tool.slug}.svg`}
              alt={`${tool.name} icon`}
              width={32}
              height={32}
              className="rounded"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="absolute inset-0 hidden items-center justify-center text-xl">🛠️</div>
          </div>
          <h3 className="text-body-semibold text-text-primary">{tool.name}</h3>
        </div>
        <ArrowUpRightIcon
          size={14}
          className="text-text-placeholder group-hover:text-text-secondary mt-1 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>

      {/* Description */}
      <p className="text-body-regular text-text-secondary mb-4 flex-1 leading-relaxed">{tool.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className={`text-caption-2-medium inline-flex items-center rounded-lg px-2 py-1 tracking-wide ${TAG_COLORS[tag] || 'bg-background-secondary-default text-text-secondary'}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Tip - subtle hover reveal */}
      {tool.tip && (
        <div className="border-separator-border bg-background-primary-default/95 text-caption-1-regular text-text-tertiary absolute inset-x-0 bottom-0 border-t px-5 py-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          {tool.tip}
        </div>
      )}
    </a>
  )
})
