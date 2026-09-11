'use client'

import { ExternalLinkIcon } from 'lucide-react'

/**
 * [INPUT]: 依赖 lucide-react 的 ExternalLinkIcon 组件
 * [OUTPUT]: 对外提供 ProjectCard 组件，展示项目卡片
 * [POS]: components/workspace/ 的项目展示组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const STATUS_CONFIG = {
  Live: {
    color: 'border-status-lime-background bg-status-lime-background text-status-lime-text',
    dot: 'bg-status-lime-text'
  },
  Building: {
    color: 'border-status-yellow-background bg-status-yellow-background text-status-yellow-text',
    dot: 'bg-status-yellow-text'
  },
  Planned: {
    color: 'border-border-button-default bg-background-secondary-default text-text-secondary',
    dot: 'bg-text-tertiary'
  }
}

export function ProjectCard({ title, tagline, status, stack, link, startDate }) {
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Planned

  return (
    <div className="border-separator-border bg-background-primary-default hover:border-border-button-hover hover:shadow-card group flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-body-semibold text-text-primary mb-1">{title}</h3>
          <p className="text-body-regular text-text-secondary">{tagline}</p>
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background-secondary-default text-text-placeholder hover:bg-background-tertiary-default hover:text-text-secondary flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Status & Date */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`text-caption-1-medium inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${statusConfig.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
          {status}
        </span>
        {startDate && (
          <span className="text-caption-1-regular text-text-tertiary">
            {new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Tech Stack */}
      <div className="mt-auto flex flex-wrap gap-1.5">
        {stack.map((tech) => (
          <span
            key={tech}
            className="bg-background-secondary-default text-caption-2-medium text-text-secondary inline-flex rounded-lg px-2 py-1"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
