## Why

博客缺少友链（Friends）页面。友链是中文博客圈的社交基础设施——互相推荐优质博客，形成去中心化的内容发现网络。当前站点有 8 个导航页面，但没有一个专门展示博主朋友和推荐站点的入口。添加友链页面能增强博客的社区属性，也为访客提供更多高质量内容入口。

## What Changes

- 新增 `/friends` 路由页面，展示友链列表
- 友链数据使用本地 JSON 文件管理（`src/data/friends.json`），包含站点名称、描述、头像、URL 等字段
- 在侧边导航 `LINKS` 数组中添加 Friends 入口
- 页面遵循现有设计语言：`ScrollArea` + `FloatingHeader` + `PageTitle` 布局模式
- 友链卡片支持头像、站名、一句话描述、链接

## Capabilities

### New Capabilities
- `friends-page`: 友链页面的路由、布局、数据结构和展示组件

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- **新增文件**: `src/app/friends/page.js`, `src/data/friends.json`, 友链卡片组件
- **修改文件**: `src/lib/constants.js`（LINKS 数组添加导航项）
- **依赖**: 无新外部依赖，使用 Lucide 现有图标
- **部署**: 纯前端静态页面，无需新环境变量
