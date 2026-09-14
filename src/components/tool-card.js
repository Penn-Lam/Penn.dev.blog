import { NotionMentionLink } from '@/components/notion-mention-link'

/**
 * [INPUT]: 依赖 NotionMentionLink 与工具数据
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

export function ToolCard({ tool }) {
  return (
    <article className="border-separator-border bg-background-primary-default hover:border-border-button-hover hover:shadow-card group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-[border-color,box-shadow] duration-300">
      <div className="mb-3">
        <NotionMentionLink url={tool.url} className="before:absolute before:inset-0">
          {tool.name}
        </NotionMentionLink>
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
    </article>
  )
}
