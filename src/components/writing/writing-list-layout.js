'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'

import { WritingLink } from '@/components/writing-link'
import { useViewData } from '@/hooks/useViewData'
import { notify } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export const WritingListLayout = ({ list, isMobile }) => {
  const { viewData, error, isLoading } = useViewData()
  const pathname = usePathname()

  useEffect(() => {
    if (error) {
      notify.error('Error loading view counts', error)
    }
  }, [error])

  const memoizedList = useMemo(() => {
    return list.map((post) => {
      const viewCount = viewData?.find((item) => item.slug === post.slug)?.view_count
      const isActive = pathname === `/writing/${post.slug}`

      return (
        <WritingLink
          key={post.slug}
          post={post}
          viewCount={viewCount}
          isMobile={isMobile}
          isActive={isActive}
          isLoading={isLoading}
        />
      )
    })
  }, [list, viewData, pathname, isMobile, isLoading])

  return <div className={cn(!isMobile && 'text-body-regular flex flex-col gap-1')}>{memoizedList}</div>
}
