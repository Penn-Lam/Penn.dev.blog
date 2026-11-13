import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { autolinkDocument, RichText } from '@/components/contentful/rich-text'
import { JourneyCard } from '@/components/journey-card'

// ==========================================================================
// 夹具：照 pennlam.com/journey 线上数据的形态构造。Logbook 网址写成裸域名纯文本，没有超链接节点。
// ==========================================================================

const text = (value, marks = []) => ({ nodeType: 'text', value, marks, data: {} })

const node = (nodeType, content = [], data = {}) => ({ nodeType, content, data })

const doc = (...content) => ({ json: node('document', content) })

const countAnchors = (html) => html.match(/<a /g)?.length ?? 0

const mentionHrefs = (html) =>
  [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*target="_blank"/g)].map((match) => match[1])

test('Journey renders bare URLs in the title and description as Notion mention chips', () => {
  const html = renderToStaticMarkup(
    <JourneyCard
      title="Join xuexi.cn AI channel"
      description={doc(
        node('paragraph', [text('As the technical lead, I led the team in designing and developing qiangguoka.com.')])
      )}
      index={0}
    />
  )

  expect(mentionHrefs(html)).toEqual(['https://xuexi.cn', 'https://qiangguoka.com'])
  // 芯片结构：favicon + 下划线网址。链接文字就是网址，所以不再重复显示灰色的站点名
  expect(html).toContain('src="https://www.google.com/s2/favicons?domain=qiangguoka.com&amp;sz=32"')
  expect(html).not.toContain('>qiangguoka</span>')
  expect(html).toContain('underline')
  // 句号留在链接外面，Journey 的芯片去掉上下内边距
  expect(html).toContain('qiangguoka.com</span></a>.')
  expect(html).toContain('py-0"')
  expect(html).not.toContain('py-0.5')
})

test('autolink keeps existing hyperlinks, headings, code and LaTeX untouched', () => {
  const source = doc(
    node('heading-2', [text('Shipped pennlam.com')]),
    node('paragraph', [
      text('Read '),
      node('hyperlink', [text('github.com/Penn-Lam')], { uri: 'https://github.com/Penn-Lam' }),
      text(' and ', []),
      text('npx foo.dev', [{ type: 'code' }]),
      text(' and $x.com$ then '),
      text('bold.com', [{ type: 'bold' }])
    ])
  )

  const snapshot = JSON.stringify(source.json)
  const linked = autolinkDocument(source.json)

  // 原文档不被修改
  expect(JSON.stringify(source.json)).toBe(snapshot)

  const [heading, paragraph] = linked.content
  expect(heading.content).toEqual([text('Shipped pennlam.com')])
  expect(paragraph.content.map((child) => child.nodeType)).toEqual([
    'text',
    'hyperlink',
    'text',
    'text',
    'text',
    'hyperlink'
  ])
  // 已有超链接内部不再嵌套
  expect(paragraph.content[1].content).toEqual([text('github.com/Penn-Lam')])
  // 自动链接保留原 marks
  expect(paragraph.content[5]).toEqual(
    node('hyperlink', [text('bold.com', [{ type: 'bold' }])], { uri: 'https://bold.com' })
  )

  const html = renderToStaticMarkup(<RichText content={source} autoLink />)
  // 标题锚点 1 个 + 原有链接 1 个 + bold.com 1 个
  expect(countAnchors(html)).toBe(3)
  expect(html).toContain('<code class="inline-code">npx foo.dev</code>')
  expect(html).toContain('<math')
})

test('RichText without autoLink keeps the blog behaviour: bare URLs stay plain text', () => {
  const content = doc(
    node('paragraph', [
      text('Visit pennlam.com or '),
      node('hyperlink', [text('GitHub')], { uri: 'https://github.com/Penn-Lam' })
    ])
  )

  const html = renderToStaticMarkup(<RichText content={content} />)

  expect(mentionHrefs(html)).toEqual(['https://github.com/Penn-Lam'])
  expect(html).toContain('Visit pennlam.com or ')
  expect(html).toContain('py-0.5')
})
