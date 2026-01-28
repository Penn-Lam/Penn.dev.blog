'use client'

import { ExternalLinkIcon } from 'lucide-react'

/**
 * [INPUT]: 依赖 lucide-react 的 ExternalLinkIcon 组件
 * [OUTPUT]: 对外提供 ProjectCard 组件，展示项目卡片
 * [POS]: components/workspace/ 的项目展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const STATUS_CONFIG = {
  Live: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
  Building: { color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' },
  Planned: { color: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' }
}

export function ProjectCard({ title, tagline, status, stack, link, startDate }) {
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Planned

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{tagline}</p>
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all duration-300 hover:bg-gray-100 hover:text-gray-600"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Status & Date */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
          {status}
        </span>
        {startDate && (
          <span className="text-xs text-gray-400">
            {new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Tech Stack */}
      <div className="mt-auto flex flex-wrap gap-1.5">
        {stack.map((tech) => (
          <span
            key={tech}
            className="inline-flex rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
