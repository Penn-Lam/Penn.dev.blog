import { expect, test } from 'bun:test'

import { HOME_CONTENT, TRUST_PAGES } from '@/data/site-content'

function characterCount(page) {
  return page.sections.flatMap((section) => [section.heading, ...section.paragraphs]).join(' ').length
}

test('homepage includes substantial crawlable copy', () => {
  expect(HOME_CONTENT.introduction.join(' ').length).toBeGreaterThanOrEqual(500)
})

test.each(Object.entries(TRUST_PAGES))('%s trust page contains at least 500 characters', (_slug, page) => {
  expect(characterCount(page)).toBeGreaterThanOrEqual(500)
})
