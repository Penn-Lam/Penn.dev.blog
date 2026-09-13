# public/
> L2 | 父级: /CLAUDE.md

静态资源根。文件路径即 URL 路径。

## 站点图标（路径即 URL，与 favicon.io 包同名）
favicon-16x16.png: 16×16 PNG，layout metadata.icons.icon
favicon-32x32.png: 32×32 PNG，layout metadata.icons.icon
apple-touch-icon.png: 180×180 PNG，layout metadata.icons.apple（iOS 主屏幕）
android-chrome-192x192.png: Android / PWA 192，app/manifest.js
android-chrome-512x512.png: Android / PWA 512，app/manifest.js
ICO 在 src/app/favicon.ico，不放这里，避免与 App Router 文件约定抢 /favicon.ico

## 品牌与内容资源
assets/logo.webp: 像素头像主稿，站点图标源图
assets/me.avif: 侧栏头像
assets/bookmark-fallback.webp / friends-card.png / leaves.png / summer-garden-ambience.mp3: 页面素材
fonts/: 签名字体
tools/: 工具页 SVG
ha/: Home Assistant 相关静态 CSS
test-musings.json: 随想测试数据

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
