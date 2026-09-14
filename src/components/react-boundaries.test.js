import { readFile } from 'node:fs/promises'

import { expect, test } from 'bun:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('keeps static workspace and stack markup outside client boundaries', async () => {
  const serverSources = await Promise.all([
    readSource('./workspace/hardware-list.js'),
    readSource('./category-section.js'),
    readSource('./tool-card.js')
  ])

  for (const source of serverSources) {
    expect(source).not.toMatch(/^['"]use client['"]/)
  }

  const deskSetupImage = await readSource('./workspace/desk-setup-image.js')

  expect(deskSetupImage).toMatch(/^['"]use client['"]/)
  expect(deskSetupImage).toContain("from 'next-cloudinary'")
})

test('loads the visual lightbox on demand and derives open state from the selected media', async () => {
  const source = await readSource('./visual/visual-explorer.js')

  expect(source).toContain("import('./lightbox-viewer')")
  expect(source).not.toContain("from './lightbox-viewer'")
  expect(source).not.toContain('isLightboxOpen')
  expect(source).toContain('selectedMedia ? (')
})
