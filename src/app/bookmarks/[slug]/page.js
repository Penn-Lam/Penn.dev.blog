import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { BookmarkList } from '@/components/bookmark-list'
import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { BookmarkShelf } from '@/components/shelves'
import { getBookmarkCollections } from '@/lib/bookmark-collections'
import { getBookshelfBooks } from '@/lib/bookshelf'
import { BOOKMARK_SHELVES } from '@/lib/constants'
import { getLocalShelfItems } from '@/lib/local-shelves'
import { getPlaylistRecords } from '@/lib/netease'
import { getBookmarkItems } from '@/lib/raindrop'
import { sortByProperty } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/bookmark-collections 的 getBookmarkCollections；依赖 @/lib/local-shelves 的 getLocalShelfItems；依赖 @/lib/netease 的 getPlaylistRecords；依赖 @/lib/bookshelf 的 getBookshelfBooks；依赖 @/lib/raindrop 的 getBookmarkItems；依赖 @/lib/constants 的 BOOKMARK_SHELVES；依赖 @/components/shelves 的 BookmarkShelf 与 @/components/bookmark-list 的 BookmarkList
 * [OUTPUT]: 默认导出 CollectionPage、generateStaticParams、generateMetadata
 * [POS]: /bookmarks/[slug] 路由。收藏夹有四种来源：画廊墙（Art，本地条目）、唱片架（Music，网易云歌单里的歌）、书架（books，微信读书优先）、
 *        其余 Raindrop 收藏夹。前两种用实物陈列，一次铺开，不带标签筛选；第三种沿用卡片列表，带标签筛选和分页。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export async function generateStaticParams() {
  const bookmarks = await getBookmarkCollections()

  return bookmarks.map((bookmark) => ({ slug: bookmark.slug }))
}

async function fetchData(slug) {
  const bookmarks = await getBookmarkCollections()
  const currentBookmark = bookmarks.find((bookmark) => bookmark.slug === slug)

  if (!currentBookmark) notFound()

  const sortedBookmarks = sortByProperty(bookmarks, 'title')
  const shelfKind = currentBookmark.shelfKind ?? BOOKMARK_SHELVES[currentBookmark._id]

  if (shelfKind) {
    const shelfItems = await fetchShelfItems(shelfKind, slug, currentBookmark._id)

    if (!shelfItems) throw new Error(`Failed to fetch items for collection ${currentBookmark._id}`)

    return { bookmarks: sortedBookmarks, currentBookmark, shelfKind, shelfItems }
  }

  const bookmarkItems = await getBookmarkItems(currentBookmark._id)

  if (!bookmarkItems?.result) {
    throw new Error(`Failed to fetch items for collection ${currentBookmark._id}`)
  }

  return {
    bookmarks: sortedBookmarks,
    currentBookmark,
    bookmarkItems
  }
}

// 唱片架摆网易云歌单里的歌，取不到时才退回本地的 music.json；画廊墙是本地条目；书架走微信读书
async function fetchShelfItems(shelfKind, slug, collectionId) {
  if (shelfKind === 'records') return (await getPlaylistRecords()) ?? getLocalShelfItems(slug)

  return getLocalShelfItems(slug) ?? (await getBookshelfBooks(collectionId))
}

export default async function CollectionPage(props) {
  const params = await props.params
  const { slug } = params
  const { bookmarks, currentBookmark, bookmarkItems, shelfKind, shelfItems } = await fetchData(slug)

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader
        scrollTitle={currentBookmark.title}
        goBackLink="/bookmarks"
        bookmarks={bookmarks}
        currentBookmark={currentBookmark}
      />
      <div className="content-wrapper">
        <div className="content @container">
          <PageTitle title={currentBookmark.title} />
          {shelfKind ? (
            <BookmarkShelf kind={shelfKind} items={shelfItems} />
          ) : (
            <Suspense fallback={<ScreenLoadingSpinner />}>
              <BookmarkList id={currentBookmark._id} initialData={bookmarkItems} collectionSlug={slug} />
            </Suspense>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

export async function generateMetadata(props) {
  const params = await props.params
  const { slug } = params
  const bookmarks = await getBookmarkCollections()
  const currentBookmark = bookmarks.find((bookmark) => bookmark.slug === slug)

  if (!currentBookmark) return null

  const siteUrl = `/bookmarks/${currentBookmark.slug}`
  const seoTitle = `${currentBookmark.title} | Bookmarks`
  const seoDescription = `A curated selection of various handpicked ${currentBookmark.title.toLowerCase()} bookmarks by Penn`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      currentBookmark.title,
      'bookmarks',
      `${currentBookmark.title} bookmarks`,
      'collection',
      `${currentBookmark.title} collection`
    ],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: siteUrl,
      images: siteUrl + '/og.png'
    },
    alternates: {
      canonical: siteUrl
    }
  }
}
