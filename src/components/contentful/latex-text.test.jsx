import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { RichText } from '@/components/contentful/rich-text'

test('Contentful formulas render without changing code literals or heading anchors', () => {
  const text = (value, marks = []) => ({ nodeType: 'text', value, marks, data: {} })

  const content = {
    json: {
      nodeType: 'document',
      data: {},
      content: [
        { nodeType: 'heading-2', data: {}, content: [text('Math examples')] },
        { nodeType: 'paragraph', data: {}, content: [text('Inline $x^2$ and $$\\frac{a}{b}$$')] },
        { nodeType: 'paragraph', data: {}, content: [text('$literal$', [{ type: 'code' }])] }
      ]
    }
  }

  const html = renderToStaticMarkup(<RichText content={content} />)

  expect(html).toContain('id="h2-math-examples"')
  expect(html).toContain('katex-display')
  expect(html).toContain('<math')
  expect(html).toContain('<code class="inline-code">$literal$</code>')
})

test('renders readable native tables and centers images without stretching their intrinsic size', () => {
  const node = (nodeType, content = [], data = {}) => ({ nodeType, content, data })
  const paragraph = (value) => node('paragraph', [{ nodeType: 'text', value, marks: [], data: {} }])

  const content = {
    json: node('document', [
      node('table', [
        node('table-row', [
          node('table-header-cell', [paragraph('策略')]),
          node('table-header-cell', [paragraph('成功率')])
        ]),
        node('table-row', [node('table-cell', [paragraph('R-BASR')]), node('table-cell', [paragraph('99.0%')])])
      ]),
      node('embedded-asset-block', [], { target: { sys: { id: 'portrait' } } })
    ]),
    links: {
      assets: { block: [{ sys: { id: 'portrait' }, url: '/portrait.png', title: 'Portrait', width: 240, height: 480 }] }
    }
  }

  const html = renderToStaticMarkup(<RichText content={content} />)

  expect(html).toContain('<table')
  expect(html).toContain('<tbody><tr>')
  expect(html).toContain('scope="col"')
  expect(html).toContain('策略')
  expect(html).toContain('99.0%')
  expect(html).toContain('overflow-x-auto')
  expect(html).toContain('items-center')
  expect(html).toContain('h-auto max-w-full')
  expect(html).toContain('width="240" height="480"')
})
