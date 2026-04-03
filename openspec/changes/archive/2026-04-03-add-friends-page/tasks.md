## 1. 数据层

- [x] 1.1 创建 `src/data/friends.json`，定义友链数据（包含示例数据）
- [x] 1.2 在 `src/lib/constants.js` 的 `LINKS` 数组中添加 Friends 导航项（Bookmarks 和 Musings 之间）

## 2. 组件层

- [x] 2.1 创建 `src/components/friend-card.js` 友链卡片组件（头像 + 站名 + 描述 + 外链，含 fallback 首字母头像）

## 3. 页面层

- [x] 3.1 创建 `src/app/friends/page.js`，使用 ScrollArea + FloatingHeader + PageTitle 布局，渲染友链列表
- [x] 3.2 实现 `generateMetadata()` 导出 SEO 元数据

## 4. 验证

- [x] 4.1 运行 lint + typecheck，确保无错误
- [x] 4.2 本地 `bun build` 验证页面构建成功，/friends 路由已生成
