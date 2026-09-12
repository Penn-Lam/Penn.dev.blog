/**
 * [INPUT]: 依赖 shared-metadata 的站点名与描述，依赖 public/ 中 Android Chrome PNG
 * [OUTPUT]: 对外提供 /manifest.webmanifest，供安装到主屏幕与 PWA 图标使用
 * [POS]: App Router 元数据约定文件，承接 Android 192/512；浏览器标签页图标在 shared-metadata.icons
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { sharedMetadata } from '@/app/shared-metadata'

export default function manifest() {
  return {
    name: sharedMetadata.title,
    short_name: 'Penn',
    description: sharedMetadata.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}
