import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { WritingList } from './writing-list'

test('renders available writings while view counts are loading', () => {
  const items = [
    [
      '2026',
      [
        {
          date: '2026-09-14T00:00:00.000Z',
          slug: 'visible-before-view-counts',
          title: 'Visible before view counts load'
        }
      ]
    ]
  ]

  const html = renderToStaticMarkup(<WritingList items={items} />)

  expect(html).toContain('Visible before view counts load')
  expect(html).not.toContain('animate-pulse space-y-4')
})
