import { readFile } from 'node:fs/promises'

import { expect, test } from 'bun:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('keeps static workspace and shelf markup outside client boundaries', async () => {
  const serverSources = await Promise.all([
    readSource('./workspace/hardware-list.js'),
    readSource('./shelves/gallery-wall.js'),
    readSource('./shelves/bookshelf.js'),
    readSource('./shelves/record-shelf.js')
  ])

  for (const source of serverSources) {
    expect(source).not.toMatch(/^['"]use client['"]/)
  }

  // 只有持有交互状态的文件是客户端组件：卡带的选中与悬停、卡带画布、指针跟随、封面加载失败后的替换、唱片拖拽、唱机
  const clientSources = await Promise.all([
    readSource('./stack/cartridge-rack.js'),
    readSource('./stack/cartridge-pile.js'),
    readSource('./pointer-tilt.js'),
    readSource('./shelves/shelf-image.js'),
    readSource('./shelves/record-disc.js'),
    readSource('./shelves/bookshelf-rows.js'),
    readSource('./vinyl-player/turntable.js'),
    readSource('./workspace/desk-setup-image.js')
  ])

  for (const source of clientSources) {
    expect(source).toMatch(/^['"]use client['"]/)
  }
})

test('loads the visual lightbox on demand and derives open state from the selected media', async () => {
  const source = await readSource('./visual/visual-explorer.js')

  expect(source).toContain("import('./lightbox-viewer')")
  expect(source).not.toContain("from './lightbox-viewer'")
  expect(source).not.toContain('isLightboxOpen')
  expect(source).toContain('selectedMedia ? (')
})

test('loads the cartridge scene on demand and keeps three out of the pose rules', async () => {
  const [pile, pose] = await Promise.all([
    readSource('./stack/cartridge-pile.js'),
    readSource('./stack/cartridge-pose.js')
  ])

  // three 只随 /stack 的画布加载，不进其他页面的包
  expect(pile).toContain("import('./cartridge-scene')")
  expect(pile).not.toContain("from './cartridge-scene'")
  expect(pile).not.toContain("from 'three'")
  // 姿态规则是纯函数，画布占位在三维代码加载之前就要算出来
  expect(pose).not.toContain("from 'three")
})
