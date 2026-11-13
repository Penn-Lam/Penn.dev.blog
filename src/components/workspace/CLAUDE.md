# workspace/
> L2 | 父级: /CLAUDE.md

/workspace 页面的组件。页面结构是标题、可交互的桌面电脑（不加边框，比正文栏宽）、设备清单。设备数据在 `src/data/workspace/hardware.json`。

## 成员清单
desk-computer/: 第三方组件，Pin UI 的 Desk Computer（MIT），原样引入，见下。
desk-stage.module.css: 桌面电脑的摆放方式：去掉第三方样式的底色和余量，让画面铺满所在的宽栏。第三方文件本身不改。
hardware-list.js: 设备清单，每行图标、名称、用途、规格；设备类别到图标的映射在这里。
easter-egg.js: 客户端组件，输入 "work hard" 触发全屏字符雨，右下角常驻一条提示。
index.js: 出口。
desk-setup-image.js: 客户端组件，Cloudinary 上的旧桌面照片。当前未挂载（照片是换设备前拍的）。
now-tag.js / project-card.js / timeline.js: 当前项目、项目卡片、工作日志。当前未挂载，对应数据在 `src/data/workspace/` 的 now.json、projects.json、log.json。

## desk-computer/
desk-computer.tsx: React 外壳，拉取 `public/library/desk-computer.svg`（约 480KB，挂载时才取）并启动引擎。
desk-computer-engine.ts: 交互引擎，不依赖 React。键盘输入、鼠标拖动、光驱、CRT 开关、自动演示，声音用 Web Audio 合成。
desk-computer.css: 样式，全部限定在 `.pdesk` 下。
来源 https://github.com/shadcn-labs/Pin-UI ，除文件头外未改动。升级时整文件替换并保留文件头。
这个目录不参与 ESLint、oxlint、Prettier（见 eslint.config.mjs、.oxlintrc.json、.prettierignore）。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
