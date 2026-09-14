import { expect, test } from 'bun:test'

import { contentfulDocumentToMarkdown, trustPageToMarkdown } from '@/lib/markdown'

test('converts Contentful headings, marked text, links, and lists to Markdown', () => {
  const content = {
    json: {
      nodeType: 'document',
      content: [
        {
          nodeType: 'heading-2',
          content: [{ nodeType: 'text', value: 'Details', marks: [] }]
        },
        {
          nodeType: 'paragraph',
          content: [
            { nodeType: 'text', value: 'Read ', marks: [] },
            {
              nodeType: 'hyperlink',
              data: { uri: 'https://example.com' },
              content: [{ nodeType: 'text', value: 'the source', marks: [{ type: 'bold' }] }]
            }
          ]
        },
        {
          nodeType: 'unordered-list',
          content: [
            {
              nodeType: 'list-item',
              content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'First', marks: [] }] }]
            }
          ]
        }
      ]
    }
  }

  expect(contentfulDocumentToMarkdown(content)).toBe(
    '## Details\n\nRead [**the source**](https://example.com)\n\n- First'
  )
})

test('renders trust-page headings sequentially', () => {
  expect(
    trustPageToMarkdown({
      title: 'About',
      sections: [{ heading: 'Background', paragraphs: ['Substantial copy.'] }]
    })
  ).toBe('# About\n\n## Background\n\nSubstantial copy.')
})
