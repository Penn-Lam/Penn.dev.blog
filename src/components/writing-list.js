'use client'

import { domAnimation, LazyMotion } from 'framer-motion'
import Link from 'next/link'
import { memo, useMemo } from 'react'

import { useViewData } from '@/hooks/useViewData'
import { cn, dateWithDayAndMonthFormatter, dateWithMonthAndYearFormatter, viewCountFormatter } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/hooks/useViewData 的视图数据，@/lib/utils 的格式化函数
 * [OUTPUT]: 对外提供 WritingList 组件，年度分组文章列表
 * [POS]: components/writing 的核心列表组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 性能优化:
// 1. 使用 React.memo 包裹子组件，避免不必要的重渲染
// 2. 移除外层 useMemo 封装 JSX（可能导致无限渲染循环）
// ==========================================================================

// 空状态组件 - 使用 memo 避免重渲染
const EmptyState = memo(function EmptyState() {
  return (
    <div className="py-8 text-center" role="status">
      <p className="text-gray-500">No writings found.</p>
      <p className="mt-2 text-sm text-gray-400">Check back later for new content.</p>
    </div>
  )
})

// 错误状态组件 - 使用 memo
const ErrorState = memo(function ErrorState({ error, onRetry }) {
  return (
    <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600" role="alert">
      <p className="font-medium">Failed to load writings</p>
      <p className="mt-1 text-sm">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm underline hover:text-red-800"
          aria-label="Retry loading writings"
        >
          Try again
        </button>
      )}
    </div>
  )
})

// 加载状态组件 - 使用 memo
const LoadingState = memo(function LoadingState() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-6 gap-2 border-t border-gray-200 py-4">
          <div className="col-span-1 hidden h-4 w-12 rounded bg-gray-200 md:block" />
          <div className="col-span-5 grid grid-cols-4 gap-2 md:grid-cols-8">
            <div className="col-span-1 h-4 w-16 rounded bg-gray-200" />
            <div className="col-span-2 h-4 w-3/4 rounded bg-gray-200 md:col-span-6" />
            <div className="col-span-1 h-4 w-12 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
})

// 视图计数组件 - 使用 memo + CSS 动画替代 Framer Motion
const ViewCount = memo(function ViewCount({ count, isLoading }) {
  if (isLoading) {
    return <span className="flex animate-pulse justify-end text-gray-400 tabular-nums">...</span>
  }
  if (count) {
    return (
      <span className="flex justify-end tabular-nums" title={`${count} views`}>
        {count}
      </span>
    )
  }
  return null
})

// 单个项目组件 - 使用 memo 避免列表重渲染
const WritingItem = memo(function WritingItem({ item, year, isFirst, viewCount, isLoading }) {
  const { title, slug, date, sys } = item
  const dateObj = new Date(date || sys?.firstPublishedAt)
  const dateWithDayAndMonth = dateWithDayAndMonthFormatter.format(dateObj)
  const dateWithMonthAndYear = dateWithMonthAndYearFormatter.format(dateObj)
  const formattedViewCount = viewCount ? viewCountFormatter.format(viewCount) : null

  return (
    <>
      <span
        className={cn(
          'pointer-events-none col-span-1 hidden items-center tabular-nums transition-colors duration-300 group-hover/list:text-gray-900 md:grid',
          isFirst && 'border-t border-gray-200'
        )}
      >
        {isFirst ? year : ''}
      </span>
      <Link
        href={`/writing/${slug}`}
        className="col-span-6 group-hover/list-item:text-gray-900 md:col-span-5"
        aria-label={`Read "${title}" published on ${dateWithMonthAndYear}`}
      >
        <span className="grid grid-cols-4 items-center gap-2 border-t border-gray-200 py-4 md:grid-cols-8">
          <span className="col-span-1 text-left tabular-nums">
            <time dateTime={date} className="hidden md:block">
              {dateWithDayAndMonth}
            </time>
            <time dateTime={date} className="md:hidden">
              {dateWithMonthAndYear}
            </time>
          </span>
          <span className="col-span-2 line-clamp-4 min-w-0 md:col-span-6">{title}</span>
          <span className="col-span-1">
            <ViewCount count={formattedViewCount} isLoading={isLoading} />
          </span>
        </span>
      </Link>
    </>
  )
})

// 年度分组组件
const YearGroup = memo(function YearGroup({ year, items, viewDataMap, isLoading }) {
  return (
    <ul className="group/list list-none" key={year}>
      {items.map((item, index) => (
        <li key={item.slug} className="group/list-item grid grid-cols-6 p-0 group-hover/list-wrapper:text-gray-300">
          <WritingItem
            item={item}
            year={year}
            isFirst={index === 0}
            viewCount={viewDataMap.get(item.slug)}
            isLoading={isLoading}
          />
        </li>
      ))}
    </ul>
  )
})

// 表头组件
const ListHeader = memo(function ListHeader() {
  return (
    <div className="grid grid-cols-6 py-2 font-medium text-gray-500">
      <span className="col-span-1 hidden text-left md:grid">Year</span>
      <span className="col-span-6 md:col-span-5">
        <span className="grid grid-cols-4 items-center md:grid-cols-8">
          <span className="col-span-1 text-left">Date</span>
          <span className="col-span-2 md:col-span-6">Title</span>
          <span className="col-span-1 text-right">Views</span>
        </span>
      </span>
    </div>
  )
})

export const WritingList = memo(function WritingList({ items, header = 'Writing' }) {
  const { viewData, error, isLoading, refetch } = useViewData()

  // 空数据检查
  const isEmpty = !items || items.length === 0

  // 视图数据 Map - 仅在 viewData 变化时重新计算
  const viewDataMap = useMemo(() => {
    if (!viewData) return new Map()
    return new Map(viewData.map((item) => [item.slug, item.view_count]))
  }, [viewData])

  // 渲染年度分组
  const renderedGroups = useMemo(() => {
    if (isEmpty) return null
    return items.map(([year, itemsArr]) => (
      <YearGroup key={year} year={year} items={itemsArr} viewDataMap={viewDataMap} isLoading={isLoading} />
    ))
  }, [items, viewDataMap, isLoading, isEmpty])

  // 早期返回空状态
  if (isEmpty && !isLoading) {
    return (
      <LazyMotion features={domAnimation}>
        <div className="text-sm" aria-label={`${header} list`}>
          <ListHeader />
          <EmptyState />
        </div>
      </LazyMotion>
    )
  }

  // 主渲染
  return (
    <LazyMotion features={domAnimation}>
      <div className="text-sm" aria-label={`${header} list`}>
        {error && <ErrorState error={error} onRetry={refetch} />}
        <ListHeader />
        {isLoading ? <LoadingState /> : <div className="group/list-wrapper">{renderedGroups}</div>}
      </div>
    </LazyMotion>
  )
})
