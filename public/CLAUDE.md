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
tools/: 旧工具页的 SVG logo。/stack 改成卡带后不再引用
stack/labels/: /stack 卡带的贴纸图，每个工具一张 `<slug>.webp`，480×320。AI 生成：以工具的官方 logo 或吉祥物为主体，画成 80 年代日本游戏卡带标签的丝网印刷风格（四色、半调网点、粗描边），主体靠右，左侧三分之一留底色
shelves/art/、shelves/music/: /bookmarks/art 与 /bookmarks/music 的封面，`<条目 id>.webp`。条目清单在 `src/data/shelves/`，文件名要和条目的 id 对上
library/desk-computer.svg: /workspace 桌面电脑的等轴测图，约 480KB，组件挂载时拉取。来自 Pin UI（MIT）
ha/: Home Assistant 相关静态 CSS
test-musings.json: 随想测试数据

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
