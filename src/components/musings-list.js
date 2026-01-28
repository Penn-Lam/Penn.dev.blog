'use client'

import { Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import { TagFilter } from './tag-filter'

/**
 * [INPUT]: 依赖 lucide-react, next/link, react-markdown 等
 * [OUTPUT]: 对外提供 MusingsList 和 MusingCard 组件
 * [POS]: components/ 的随想列表组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

function MusingCard({ musing }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(musing.created_at)
  const formattedDate = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const contentRef = useRef(null)
  const [showExpand, setShowExpand] = useState(false)

  useEffect(() => {
    if (expanded || !contentRef.current) {
      setShowExpand(false)
      return
    }
    const el = contentRef.current
    const hasImage = el.querySelector('img') !== null
    setShowExpand(hasImage || el.scrollHeight > 400)
  }, [expanded])

  return (
    <article className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          <time dateTime={musing.created_at}>{formattedDate}</time>
        </div>
        <Link
          href={musing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-300 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
        >
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Content */}
      <div
        className="prose prose-gray prose-sm relative max-w-none leading-relaxed text-gray-600"
        style={!expanded ? { maxHeight: 400, overflow: 'hidden' } : {}}
        ref={contentRef}
      >
        <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm]}>
          {musing.body?.replace(/\n/g, '  \n').trim() || ''}
        </ReactMarkdown>
        {!expanded && showExpand && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {/* Expand button */}
      {showExpand && (
        <button
          className="mt-4 self-start rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 transition-all duration-200 hover:border-gray-300 hover:text-gray-700 hover:shadow-sm"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? '收起' : '展开'}
        </button>
      )}

      {/* Tags */}
      {musing.tags?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {musing.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export function MusingsList({ musings, selectedTag }) {
  const allTags = useMemo(() => {
    const tags = new Set()
    musings.forEach((musing) => {
      if (musing.tags) {
        musing.tags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [musings])

  const filteredMusings = useMemo(() => {
    if (!selectedTag) return musings
    return musings.filter((musing) => musing.tags && musing.tags.includes(selectedTag))
  }, [musings, selectedTag])

  return (
    <div>
      <TagFilter tags={allTags} selectedTag={selectedTag} />

      <div className="mt-6">
        {filteredMusings.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <p className="text-gray-400">No musings found</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 space-y-4 md:columns-2">
            {filteredMusings.map((musing) => (
              <MusingCard key={musing.id} musing={musing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
