import { readFile } from 'node:fs/promises'

import { expect, test } from 'bun:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('keeps non-critical homepage rendering work off the initial path', async () => {
  const [layout, writingList, nextConfig] = await Promise.all([
    readSource('../app/layout.js'),
    readSource('./writing-list.js'),
    readSource('../../next.config.mjs')
  ])
  const primaryFont = layout.slice(layout.indexOf('const iaWriterQuattroS'), layout.indexOf('const fzPingXianYaSong'))

  expect(primaryFont).toContain("display: 'optional'")
  expect(writingList).not.toContain("from 'framer-motion'")
  expect(nextConfig).toContain('inlineCss: true')
})
