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
stack/labels/: /stack 卡带的贴纸图，每个工具一张 `<slug>.webp`，480×320。两种画风并存。新画风（chatgpt、notion、paper、amp、tailscale）：16 位像素画背景加像素字体，只用该品牌官网的颜色、官方 logo 或吉祥物；每张的版式取自该产品自己的场景（对话气泡、页面卡片、软件窗口、游戏对话框、夜景招牌），不共用模板。旧画风（其余各张）：80 年代日本游戏卡带标签的丝网印刷风格（四色、半调网点、粗描边）。zed 是喷绘赛车图。卡带标签框比 3:2 略扁，上下各裁掉约 3%，重要内容不贴边。`tools.json` 的 `shell` 外壳色随贴纸取品牌色
shelves/art/、shelves/music/: /bookmarks/art 与 /bookmarks/music 的封面，`<条目 id>.webp`。条目清单在 `src/data/shelves/`，文件名要和条目的 id 对上
turntable/CREDITS.txt: 唱机原图的出处、许可（CC BY 4.0）和改动说明
turntable/body.webp、arm.webp: /bookmarks/music 唱机的机身（含投影、旋钮）和唱臂，880×880 透明底，机身占中间 800×800。从设计稿 PDF 导出：用 qpdf 解开后等长抹掉不要的绘制指令，用 pdftoppm 分别渲染在白底和黑底上，再由两张图反推透明度。pdftocairo 和转 SVG 的路子会把原稿的混合效果渲染发灰，不能用
library/desk-computer.svg: /workspace 桌面电脑的等轴测图，约 480KB，组件挂载时拉取。来自 Pin UI（MIT）
ha/: Home Assistant 相关静态 CSS
test-musings.json: 随想测试数据

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
