import { existsSync } from 'node:fs'

import { expect, test } from 'bun:test'

import { getLocalShelfItems, LOCAL_SHELF_COLLECTIONS } from './local-shelves'

test('local shelves appear as collections with their item counts', () => {
  expect(LOCAL_SHELF_COLLECTIONS.map((collection) => [collection.slug, collection.shelfKind])).toEqual([
    ['art', 'gallery'],
    ['music', 'records']
  ])

  for (const collection of LOCAL_SHELF_COLLECTIONS) {
    expect(collection.count).toBe(getLocalShelfItems(collection.slug).length)
  }
})

test('every local item has a unique id, a title, and a cover file that exists in public', () => {
  for (const { slug } of LOCAL_SHELF_COLLECTIONS) {
    const items = getLocalShelfItems(slug)

    expect(new Set(items.map((item) => item.id)).size).toBe(items.length)

    for (const item of items) {
      expect(item.title).toBeTruthy()

      if (item.cover) {
        expect(item.cover.startsWith(`/shelves/${slug}/`)).toBe(true)
        expect(existsSync(new URL(`../../public${item.cover}`, import.meta.url))).toBe(true)
        expect(item.width).toBeGreaterThan(0)
        expect(item.height).toBeGreaterThan(0)
      }
    }
  }
})

test('unknown slugs are not local shelves', () => {
  expect(getLocalShelfItems('reading')).toBeNull()
})
