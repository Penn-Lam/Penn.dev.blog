import { describe, expect, test } from 'bun:test'

import { mapWereadShelf, upgradeWereadCover } from './weread-shelf'

describe('upgradeWereadCover', () => {
  test('swaps the small cover file for the larger one', () => {
    expect(upgradeWereadCover('https://img.example.com/cover/477/629477/s_629477.jpg')).toBe(
      'https://img.example.com/cover/477/629477/t4_629477.jpg'
    )
  })

  test('leaves other file names and empty values untouched', () => {
    expect(upgradeWereadCover('https://img.example.com/outpic/556/3003872556.jpg')).toBe(
      'https://img.example.com/outpic/556/3003872556.jpg'
    )
    expect(upgradeWereadCover('')).toBe('')
    expect(upgradeWereadCover(undefined)).toBeUndefined()
  })
})

describe('mapWereadShelf', () => {
  const payload = {
    books: [
      { bookId: '1', title: 'Older', author: 'A', cover: 'https://img.example.com/c/s_1.jpg', readUpdateTime: 100 },
      { bookId: '2', title: 'Private', author: 'B', cover: 'https://img.example.com/c/s_2.jpg', secret: 1 },
      {
        bookId: '3',
        title: 'Newer',
        author: 'C',
        cover: 'https://img.example.com/c/s_3.jpg',
        readUpdateTime: 300,
        secret: 0,
        readerLink: 'weread://reader?bookId=3',
        deepLink: 'https://weread.qq.com/web/bookDetail/abc'
      },
      { bookId: '4', title: '', author: 'D' }
    ]
  }

  test('drops private and untitled books and sorts by most recently read', () => {
    expect(mapWereadShelf(payload).map((book) => book.title)).toEqual(['Newer', 'Older'])
  })

  test('keeps only https links and exposes both cover sizes', () => {
    const [newer, older] = mapWereadShelf(payload)

    expect(newer).toEqual({
      id: 'weread-3',
      title: 'Newer',
      subtitle: 'C',
      cover: 'https://img.example.com/c/t4_3.jpg',
      fallbackCover: 'https://img.example.com/c/s_3.jpg',
      href: 'https://weread.qq.com/web/bookDetail/abc'
    })
    expect(older.href).toBeNull()
  })

  test('returns an empty list for an empty or missing payload', () => {
    expect(mapWereadShelf({})).toEqual([])
    expect(mapWereadShelf(null)).toEqual([])
  })
})
