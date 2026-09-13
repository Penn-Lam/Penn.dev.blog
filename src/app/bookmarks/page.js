import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { getPageSeo } from '@/lib/contentful'
import { getBookmarks } from '@/lib/raindrop'
import { sortByProperty } from '@/lib/utils'

async function fetchData() {
  const bookmarks = await getBookmarks()
  const sortedBookmarks = sortByProperty(bookmarks, 'title')

  return { bookmarks: sortedBookmarks }
}

export default async function Writing() {
  const { bookmarks } = await fetchData()

  return (
    <ScrollArea className="lg:hidden">
      <FloatingHeader title="Bookmarks" bookmarks={bookmarks} />
      <Suspense fallback={<ScreenLoadingSpinner />}>
        {bookmarks?.map((bookmark) => {
          return (
            <Link
              key={bookmark._id}
              href={`/bookmarks/${bookmark.slug}`}
              className="border-separator-border hover:bg-background-secondary-default text-body-regular flex flex-col gap-1 border-b px-4 py-3"
            >
              <span className="text-body-medium">{bookmark.title}</span>
              <span className="text-text-secondary">{bookmark.count} bookmarks</span>
            </Link>
          )
        })}
      </Suspense>
    </ScrollArea>
  )
}

export async function generateMetadata() {
  const seoData = await getPageSeo('bookmarks')

  if (!seoData) return null

  const seo = seoData.seo || {}
  const { title, description } = seo
  const siteUrl = '/bookmarks'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteUrl
    },
    alternates: {
      canonical: siteUrl
    }
  }
}
