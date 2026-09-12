'use client'

import { RadioIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { ButtonLink } from '@/components/base/buttons/button'
import { LoadingSpinner } from '@/components/loading-spinner'
import { useDialogState } from '@/components/quick-post-button'
import { ScrollArea } from '@/components/scroll-area'
import { useSidebarCollapse } from '@/components/sidebar-collapse'

const SubmitBookmarkDialog = dynamic(
  () => import('@/components/submit-bookmark/dialog').then((mod) => mod.SubmitBookmarkDialog),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

import { useKeyPress } from '@/hooks/useKeyPress'
import { cn } from '@/lib/utils'

const keyCodePathnameMapping = {
  Digit1: '/',
  Digit2: '/writing',
  Digit3: '/journey',
  Digit4: '/stack',
  Digit5: '/workspace',
  Digit6: '/visual',
  Digit7: '/bookmarks',
  Digit8: '/friends'
}

export const SideMenu = ({ children, title, bookmarks = [], isInner }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { isQuickPostOpen } = useDialogState()
  const { collapsed } = useSidebarCollapse()

  useKeyPress(onKeyPress, Object.keys(keyCodePathnameMapping), isQuickPostOpen)

  function onKeyPress(event) {
    const key = event.code
    const targetPathname = keyCodePathnameMapping[key]
    if (targetPathname && targetPathname !== pathname) router.push(targetPathname)
  }

  const isWritingPath = pathname.startsWith('/writing')
  const isBookmarksPath = pathname.startsWith('/bookmarks')
  const currentBookmark = bookmarks.find((bookmark) => `/bookmarks/${bookmark.slug}` === pathname)

  const memoizedScrollArea = useMemo(
    () => (
      <ScrollArea
        className={cn(
          'lg:border-border-button-white lg:bg-background-secondary-default lg:shadow-sidebar hidden lg:m-3 lg:flex lg:h-[calc(100vh-1.5rem)] lg:flex-col lg:rounded-3xl lg:border',
          'transition-[margin] duration-300 ease-in-out',
          collapsed && 'lg:-ml-[212px]',
          isInner ? 'lg:w-80 xl:w-96' : 'lg:w-60 xl:w-72'
        )}
      >
        {title && (
          <div className="border-separator-border bg-background-secondary-default sticky top-0 z-10 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-body-semibold">{title}</span>
              <div className="flex items-center gap-2">
                {(isWritingPath || isBookmarksPath) && (
                  <ButtonLink
                    href={isWritingPath ? '/writing.xml' : '/bookmarks.xml'}
                    title="RSS feed"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="xs"
                    leadingIcon={RadioIcon}
                  >
                    RSS feed
                  </ButtonLink>
                )}
                {isBookmarksPath && <SubmitBookmarkDialog bookmarks={bookmarks} currentBookmark={currentBookmark} />}
              </div>
            </div>
          </div>
        )}
        <div className="bg-background-secondary-default flex flex-1 flex-col p-3">{children}</div>
      </ScrollArea>
    ),
    [isInner, title, isWritingPath, isBookmarksPath, bookmarks, currentBookmark, children, collapsed]
  )

  return memoizedScrollArea
}
