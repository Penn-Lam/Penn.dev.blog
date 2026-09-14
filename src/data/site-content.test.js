import { readFile } from 'node:fs/promises'

import { expect, test } from 'bun:test'

import { HOME_CONTENT, TRUST_PAGES } from '@/data/site-content'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

function characterCount(page) {
  return page.sections.flatMap((section) => [section.heading, ...section.paragraphs]).join(' ').length
}

test('homepage includes substantial crawlable copy', () => {
  expect(HOME_CONTENT.introduction.join(' ').length).toBeGreaterThanOrEqual(500)
})

test('homepage preserves its concise visual introduction and exposes richer semantic content', async () => {
  const source = await readSource('../app/page.js')

  expect(source).toContain('<PageTitle title={HOME_CONTENT.title} className="sr-only" />')
  expect(source).toContain('<p aria-hidden="true">')
  expect(source).toContain('<div className="sr-only">')
  expect(source).not.toContain('aria-label="Site information"')
})

test.each(Object.entries(TRUST_PAGES))('%s trust page contains at least 500 characters', (_slug, page) => {
  expect(characterCount(page)).toBeGreaterThanOrEqual(500)
})
