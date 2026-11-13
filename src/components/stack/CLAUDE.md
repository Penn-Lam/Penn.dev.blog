# stack/
> L2 | 父级: /CLAUDE.md

/stack 页面的卡带。每个工具是一盘游戏卡带，同一分类的卡带平躺成一摞。
数据在 `src/data/tools.json`（每个工具带 `shell` 外壳色和 `label` 贴纸路径），贴纸图在 `public/stack/labels/`。

## 成员清单
cartridge-rack.js: 客户端组件，一个分类的区块。左边工具清单，右边一摞卡带；持有选中项和悬停项，按选中位置给每盘卡带算让位方向；处理方向键与 Esc。
cartridge.js: 单盘卡带的结构，无状态。按钮里一层 `.body`，里面是六个面、顶部模压的工具名、贴纸图；由 slug 派生固定的静止偏角与错位。
cartridge.module.css: 纯 CSS 3D。尺寸变量在 `.pile` 上；姿态由 `li` 的 `data-peek`、`data-selected` 和 `--shift` 决定。

## 约定
清单是信息本体，卡带是它的实物索引。工具的链接和说明只出现在清单里。tools.json 里的 `tip` 字段目前不显示。
三层变换各管一件事：`.slot` 管进入页面时的落入动画，`.cart` 管姿态切换（弹簧过渡），`.body` 管跟随指针的倾斜（逐帧更新，不加过渡）。
`.slot` 设了 `pointer-events: none`：它的盒子比卡带的可见形状大，不这样会挡住下面那盘卡带的点击。
不给 `.cart` 加 `filter`，不用 `overflow: hidden` 包它，两者都会把 3D 压平。
新增工具：在 tools.json 加一条，放一张 480×320 的 WebP 到 `public/stack/labels/<slug>.webp`。贴纸画风见 `public/CLAUDE.md`。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
