'use client'

import { domAnimation, LazyMotion, m } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'

import { useViewData } from '@/hooks/useViewData'
import { cn, dateWithDayAndMonthFormatter, dateWithMonthAndYearFormatter, viewCountFormatter } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/hooks/useViewData 的视图数据，@/lib/utils 的格式化函数
 * [OUTPUT]: 对外提供 WritingList 组件，年度分组文章列表
 * [POS]: components/writing 的核心列表组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 空状态组件
function EmptyState({ header }) {
  return (
    <div className="py-8 text-center" role="status">
      <p className="text-gray-500">No writings found.</p>
      <p className="mt-2 text-sm text-gray-400">Check back later for new content.</p>
    </div>
  )
}

// 错误状态组件
function ErrorState({ error, onRetry }) {
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
}

// 加载状态组件
function LoadingState() {
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
}

export const WritingList = ({ items, header = 'Writing' }) => {
  const { viewData, error, isLoading, refetch } = useViewData()

  // 空数据检查
  const isEmpty = !items || items.length === 0

  // Preprocess viewData into a map for efficient lookups
  const viewDataMap = useMemo(() => {
    if (!viewData) return new Map()
    const map = new Map()
    viewData.forEach((item) => {
      map.set(item.slug, item.view_count)
    })
    return map
  }, [viewData])

  // Memoize animation props
  const animationProps = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    }),
    []
  )

  // Memoize the items mapping to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    if (isEmpty) return null

    return items.map((item) => {
      const [year, itemsArr] = item

      return (
        <ul className="group/list list-none" key={year}>
          {itemsArr.map((item, itemIndex) => {
            // 边界情况：检查必要字段
            if (!item || !item.sys) {
              return null
            }

            const {
              title,
              slug,
              date,
              sys: { firstPublishedAt }
            } = item
            const dateObj = new Date(date || firstPublishedAt)
            const dateWithDayAndMonth = dateWithDayAndMonthFormatter.format(dateObj)
            const dateWithMonthAndYear = dateWithMonthAndYearFormatter.format(dateObj)

            const view_count = viewDataMap.get(slug)
            const formattedViewCount = view_count ? viewCountFormatter.format(view_count) : null

            return (
              <li key={slug} className="group/list-item grid grid-cols-6 p-0 group-hover/list-wrapper:text-gray-300">
                <span
                  className={cn(
                    'pointer-events-none col-span-1 hidden items-center tabular-nums transition-colors duration-300 group-hover/list:text-gray-900 md:grid',
                    itemIndex === 0 && 'border-t border-gray-200'
                  )}
                >
                  {itemIndex === 0 ? year : ''}
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
                    {/* 标题：文本溢出处理 */}
                    <span className="col-span-2 line-clamp-4 min-w-0 md:col-span-6">{title}</span>
                    {isLoading ? (
                      <span className="col-span-1">
                        <m.span
                          key={`${slug}-views-loading`}
                          className="flex animate-pulse justify-end text-gray-400 tabular-nums"
                          aria-label="Loading view count"
                        >
                          ...
                        </m.span>
                      </span>
                    ) : formattedViewCount ? (
                      <span className="col-span-1">
                        <m.span
                          key={`${slug}-views`}
                          className="flex justify-end tabular-nums"
                          title={`${formattedViewCount} views`}
                          {...animationProps}
                        >
                          {formattedViewCount}
                        </m.span>
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )
    })
  }, [animationProps, items, viewDataMap, isLoading, isEmpty])

  // 显示空状态
  if (isEmpty && !isLoading) {
    return (
      <LazyMotion features={domAnimation}>
        <div className="text-sm" aria-label={`${header} list`}>
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
          <EmptyState header={header} />
        </div>
      </LazyMotion>
    )
  }

  return useMemo(
    () => (
      <LazyMotion features={domAnimation}>
        <div className="text-sm" aria-label={`${header} list`}>
          {/* 错误状态 */}
          {error && <ErrorState error={error} onRetry={refetch} />}

          {/* 表头 */}
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

          {/* 加载状态或内容 */}
          {isLoading ? <LoadingState /> : <div className="group/list-wrapper">{renderedItems}</div>}
        </div>
      </LazyMotion>
    ),
    [renderedItems, error, isLoading, refetch, header]
  )
}
