import { domAnimation, LazyMotion, m } from 'framer-motion'
import Link from 'next/link'

import { cn, getDateTimeFormat, viewCountFormatter } from '@/lib/utils'

export const WritingLink = ({ post, viewCount, isMobile, isActive, isLoading }) => {
  const date = post.date || post.sys.firstPublishedAt
  const formattedDate = getDateTimeFormat(date)
  const formattedViewCount = viewCount ? viewCountFormatter.format(viewCount) : null

  return (
    <LazyMotion features={domAnimation}>
      <Link
        key={post.slug}
        href={`/writing/${post.slug}`}
        className={cn(
          'flex flex-col gap-1 transition-colors duration-300',
          !isMobile && isActive
            ? 'bg-text-primary text-background-primary-default'
            : 'hover:bg-background-secondary-default',
          isMobile
            ? 'border-separator-border hover:bg-background-secondary-default text-body-regular border-b px-4 py-3'
            : 'rounded-lg p-2'
        )}
      >
        <span className="text-body-medium">{post.title}</span>
        <span className={cn('transition-colors duration-300', isActive ? 'text-text-tertiary' : 'text-text-secondary')}>
          <time dateTime={date}>{formattedDate}</time>{' '}
          <span>
            {isLoading ? (
              <m.span
                key={`${post.slug}-views-loading`}
                className="text-text-tertiary animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                ...
              </m.span>
            ) : formattedViewCount ? (
              <m.span
                key={`${post.slug}-views-loaded`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="tabular-nums"
              >
                &middot; {formattedViewCount} {formattedViewCount === 1 ? 'view' : 'views'}
              </m.span>
            ) : (
              <m.span key={`${post.slug}-views-empty`} />
            )}
          </span>
        </span>
      </Link>
    </LazyMotion>
  )
}
