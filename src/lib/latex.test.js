import { expect, test } from 'bun:test'

import { renderLatex } from '@/lib/latex'

test('renders inline and block delimiters with accessible MathML', () => {
  const parts = renderLatex(String.raw`before $x^2$ after $$\frac{a}{b}$$`)
  expect(parts[0].text).toBe('before ')
  expect(parts[1].display).toBe(false)
  expect(parts[1].html).toContain('<math')
  expect(parts[3].display).toBe(true)
  expect(renderLatex(String.raw`\(x\) \[y\]`).filter((part) => part.type === 'math')).toHaveLength(2)
})

test('keeps invalid math, ordinary text, and escaped dollars intact; disallows trusted HTML', () => {
  expect(renderLatex('price $5, unmatched')).toEqual([{ type: 'text', text: 'price $5, unmatched' }])
  expect(renderLatex(String.raw`\$5 and \$10`)).toEqual([{ type: 'text', text: String.raw`\$5 and \$10` }])
  expect(renderLatex(String.raw`$\notACommand$`)).toEqual([{ type: 'text', text: String.raw`$\notACommand$` }])
  const part = renderLatex(String.raw`$\href{javascript:alert(1)}{x}$`)[0]
  expect(part.html).not.toContain('href="javascript:')
})
