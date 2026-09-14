import { expect, test } from 'bun:test'

import { LLMS_TEXT } from '@/lib/llms'

test('llms.txt gives agents specific usage and non-inference guidance', () => {
  expect(LLMS_TEXT).toContain('## When to use this site')
  expect(LLMS_TEXT).toContain('Use /writing')
  expect(LLMS_TEXT).toContain('Do not infer a company, office address, telephone number, or private contact detail')
  expect(LLMS_TEXT).toContain('/sitemap.xml')
})
