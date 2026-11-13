import { expect, test } from 'bun:test'

import { raindropToShelfItem, withReferral } from './shelf-items'

test('withReferral adds the ref without breaking existing query strings', () => {
  expect(withReferral('https://example.com/a')).toBe('https://example.com/a?ref=pennlam.com')
  expect(withReferral('https://example.com/a?x=1#top')).toBe('https://example.com/a?x=1&ref=pennlam.com#top')
  expect(withReferral('not a url')).toBe('not a url')
})

test('raindropToShelfItem keeps only what a shelf shows and upgrades http covers', () => {
  expect(
    raindropToShelfItem({
      _id: 42,
      title: 'Damian Elwes',
      link: 'https://damianelwes.com',
      cover: 'http://static1.squarespace.com/cover.jpg',
      excerpt: 'dropped',
      tags: ['Gallery']
    })
  ).toEqual({
    id: '42',
    title: 'Damian Elwes',
    subtitle: '',
    cover: 'https://static1.squarespace.com/cover.jpg',
    fallbackCover: null,
    href: 'https://damianelwes.com/?ref=pennlam.com'
  })
})

test('raindropToShelfItem tolerates a missing cover and link', () => {
  expect(raindropToShelfItem({ _id: 1, title: 'x', cover: '' })).toMatchObject({ cover: null, href: null })
})
