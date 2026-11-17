import 'server-only'

import { COLLECTION_IDS } from '@/lib/constants'

/**
 * [INPUT]: 依赖环境变量 RAINDROP_ACCESS_TOKEN；依赖 @/lib/constants 的 COLLECTION_IDS；依赖 Raindrop REST API
 * [OUTPUT]: 对外提供 getBookmarks（收藏夹列表）、getBookmarkItems（一页条目）、getAllBookmarkItems（全部条目）、getBookmark（单个收藏夹）
 * [POS]: lib/ 的 Raindrop 数据源。/bookmarks 的卡片列表和 books 书架的回退都从这里取数，结果缓存 1 小时。
 *        超时信号必须每次请求新建：AbortSignal.timeout 从创建那一刻开始计时，放在模块级会让服务启动 30 秒后的所有请求立刻被中止。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const REQUEST_TIMEOUT_MS = 30000

const requestOptions = () => ({
  cache: 'force-cache',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.RAINDROP_ACCESS_TOKEN}`
  },
  next: {
    revalidate: 60 * 60 // 1 hour
  },
  signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
})

const RAINDROP_API_URL = 'https://api.raindrop.io/rest/v1'

export const getBookmarkItems = async (id, pageIndex = 0) => {
  if (!id) throw new Error('Bookmark ID is required')

  if (!Number.isInteger(pageIndex) || pageIndex < 0) {
    throw new Error('Invalid page index')
  }

  try {
    const response = await fetch(
      `${RAINDROP_API_URL}/raindrops/${id}?` +
        new URLSearchParams({
          page: pageIndex,
          perpage: 50
        }),
      requestOptions()
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error(`Failed to fetch bookmark items for collection ${id}: ${error.message}`)

    return null
  }
}

const MAX_COLLECTION_PAGES = 10

/**
 * 取一个收藏夹的全部条目，供实物陈列一次铺开。接口每页 50 条，最多翻 MAX_COLLECTION_PAGES 页。
 * 第一页失败时返回 null；后续页失败时返回已取到的部分。
 */
export const getAllBookmarkItems = async (id) => {
  const firstPage = await getBookmarkItems(id, 0)

  if (!firstPage?.result) return null

  const items = [...firstPage.items]

  for (let pageIndex = 1; items.length < firstPage.count && pageIndex < MAX_COLLECTION_PAGES; pageIndex++) {
    const page = await getBookmarkItems(id, pageIndex)

    if (!page?.result || page.items.length === 0) break

    items.push(...page.items)
  }

  return items
}

export const getBookmarks = async () => {
  try {
    const response = await fetch(`${RAINDROP_API_URL}/collections`, requestOptions())

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const bookmarks = await response.json()

    return bookmarks.items.filter((bookmark) => COLLECTION_IDS.includes(bookmark._id))
  } catch (error) {
    console.error(`Failed to fetch bookmarks: ${error.message}`)

    throw error
  }
}

export const getBookmark = async (id) => {
  try {
    const response = await fetch(`${RAINDROP_API_URL}/collection/${id}`, requestOptions())

    return await response.json()
  } catch (error) {
    console.info(error)

    return null
  }
}
