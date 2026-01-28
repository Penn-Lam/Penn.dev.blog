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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      {/* Header: Icon + Name + Arrow */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
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
          <h3 className="text-sm font-semibold text-gray-900">{tool.name}</h3>
        </div>
        <ArrowUpRightIcon
          size={14}
          className="mt-1 text-gray-300 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gray-500"
        />
      </div>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">{tool.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-medium tracking-wide ${TAG_COLORS[tag] || 'bg-gray-50 text-gray-600'}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Tip - subtle hover reveal */}
      {tool.tip && (
        <div className="absolute inset-x-0 bottom-0 border-t border-gray-50 bg-white/95 px-5 py-3 text-xs text-gray-400 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          {tool.tip}
        </div>
      )}
    </a>
  )
})
