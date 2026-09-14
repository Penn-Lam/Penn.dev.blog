import { describe, expect, test } from 'bun:test'

import { appendNegotiationVary, preferredRepresentation } from '@/lib/content-negotiation'

describe('preferredRepresentation', () => {
  test.each([
    [null, 'text/html'],
    ['*/*', 'text/html'],
    ['text/html', 'text/html'],
    ['text/markdown', 'text/markdown'],
    ['text/markdown, text/html;q=0.8', 'text/markdown'],
    ['text/html;q=0.9, text/markdown;q=0.5', 'text/html'],
    ['text/markdown;q=0, text/html', 'text/html'],
    ['text/html;q=0, */*;q=1', 'text/markdown'],
    ['application/pdf', null],
    ['text/html;q=0, text/markdown;q=0', null]
  ])('selects a representation for %s', (accept, expected) => {
    expect(preferredRepresentation(accept)).toBe(expected)
  })
})

test('adds both cache keys without discarding existing Vary values', () => {
  const headers = new Headers({ Vary: 'RSC, Accept' })

  appendNegotiationVary(headers)

  expect(headers.get('Vary')).toBe('RSC, Accept, Accept-Encoding')
})
