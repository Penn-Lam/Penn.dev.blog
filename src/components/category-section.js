'use client'

import { ToolCard } from './tool-card'

/**
 * [INPUT]: 依赖 ./tool-card 的 ToolCard 组件
 * [OUTPUT]: 对外提供 CategorySection 组件，展示工具分类区块
 * [POS]: components/ 的分类展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const CategorySection = ({ id, name, tools }) => {
  return (
    <section className="mb-16 scroll-mt-20" id={id}>
      <h2 className="mb-6 text-xl font-bold text-gray-900">{name}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  )
}
