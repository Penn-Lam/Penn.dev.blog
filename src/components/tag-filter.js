'use client'

import Link from 'next/link'

/**
 * [INPUT]: 依赖 next/link
 * [OUTPUT]: 对外提供 TagFilter 组件，标签筛选器
 * [POS]: components/ 的标签筛选组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function TagFilter({ tags, selectedTag }) {
  if (tags.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/musings"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
            !selectedTag ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          All
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/musings?tag=${encodeURIComponent(tag)}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              selectedTag === tag
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
