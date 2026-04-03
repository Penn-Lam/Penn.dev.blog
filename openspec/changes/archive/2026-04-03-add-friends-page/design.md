## Context

Penn.dev.blog 是一个 Next.js 15 个人博客，使用 App Router、Tailwind CSS v4、shadcn/ui 组件库。所有页面遵循统一布局模式：`ScrollArea` → `FloatingHeader` → `content-wrapper` → `content`。导航通过 `src/lib/constants.js` 的 `LINKS` 数组集中管理。静态数据页面（如 Stack）使用本地 JSON 文件作为数据源。

## Goals / Non-Goals

**Goals:**
- 新增 `/friends` 页面，展示友链列表
- 与现有页面保持一致的布局和设计语言
- 友链数据易于维护（编辑 JSON 即可增删改）
- 支持头像、站名、描述、URL 展示

**Non-Goals:**
- 不做友链申请表单（后续可加）
- 不做分类/标签筛选
- 不接入 CMS，保持本地 JSON 的简洁性
- 不做友链状态检测（是否可访问）

## Decisions

### 1. 数据源：本地 JSON 文件
**选择**: `src/data/friends.json`
**理由**: 友链数据量小、变更频率低，与 Stack 页面的 `tools.json` 模式一致。无需引入 CMS 或数据库的额外复杂度。
**备选**: Contentful CMS — 过度设计，友链不需要富文本或草稿流程。

### 2. 友链卡片组件
**选择**: 新建 `src/components/friend-card.js` 独立组件
**理由**: 卡片包含头像+文字+链接的复合布局，值得独立组件化。使用 `next/image` 加载头像，外链使用 `target="_blank" rel="noopener noreferrer"`。
**备选**: 直接在 page.js 内联渲染 — 违反单一职责，且卡片逻辑有一定复杂度。

### 3. 头像方案
**选择**: 优先使用站点 favicon（`{url}/favicon.ico`）作为默认头像，JSON 中可覆盖自定义头像 URL。
**理由**: 减少维护成本，大多数站点都有 favicon。自定义字段提供灵活性。
**备选**: 全部手动上传 Cloudinary — 维护成本高。

### 4. 导航位置
**选择**: 在 `LINKS` 数组中 Bookmarks 之后、Musings 之前插入 Friends。
**理由**: Friends 和 Bookmarks 都是"外部链接集合"的语义，放在一起符合认知分组。

## Risks / Trade-offs

- **[favicon 加载失败]** → 使用 fallback：站名首字母作为占位符（纯 CSS 实现）
- **[友链数量增长]** → 当前设计为平铺列表，50 条以内无性能问题。超过后可引入分组
- **[图片域名白名单]** → `next.config.mjs` 的 `images.remotePatterns` 需要添加友链头像域名，或使用 `<img>` 标签 unoptimized
