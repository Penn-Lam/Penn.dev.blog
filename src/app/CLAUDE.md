# src/app/
> L2 | 父级: /CLAUDE.md

App Router 根。不要再写动态 `icon.js`。

## 站点图标
favicon.ico: 多尺寸 ICO（16/32/48），文件约定自动注入 `/favicon.ico`
shared-metadata.js: 标题、描述、OG，以及 16/32 PNG 与 apple-touch-icon 的 icons 清单；layout.js 原样导出
manifest.js: 生成 `/manifest.webmanifest`，只放 Android 192/512（安装到主屏幕，不进标签页 `<link rel="icon">`）

## 根契约
layout.js: 根布局 + `metadata` / `viewport`（主题色 white，与 manifest 对齐）
shared-metadata.js: 站点标题、描述、OG 尺寸，被 layout 与 manifest 共用
opengraph-image.js: 默认 OG 图；各子路由可覆盖
page.js: 首页
not-found.js: 全局 404
robots.js / sitemap.js: 爬虫入口
llms.txt/: AI agent 使用与发现入口

## 路由
[slug]/: 构建时已知的 Contentful 动态页；未知 slug 必须保持真实 404
about/ contact/ privacy/: 静态信任页
writing/ bookmarks/ journey/ stack/ workspace/ visual/ friends/ musings/: 内容分区
sign-in/: 登录
api/: Route Handlers（auth、comments、draft、revalidate、提交表单等）

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
