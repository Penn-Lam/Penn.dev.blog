## ADDED Requirements

### Requirement: 友链页面路由
系统 SHALL 在 `/friends` 路径提供友链页面，使用与其他页面一致的布局模式（ScrollArea + FloatingHeader + PageTitle）。

#### Scenario: 访问友链页面
- **WHEN** 用户访问 `/friends`
- **THEN** 页面展示标题 "Friends"、页面描述文案、以及友链卡片列表

#### Scenario: 页面 SEO 元数据
- **WHEN** 搜索引擎抓取 `/friends`
- **THEN** 页面 SHALL 包含 title、description、openGraph、canonical URL 元数据

### Requirement: 友链数据结构
系统 SHALL 从 `src/data/friends.json` 读取友链数据。每条友链记录 MUST 包含以下字段：
- `name`: 站点名称（string, 必填）
- `url`: 站点链接（string, 必填）
- `description`: 一句话描述（string, 必填）
- `avatar`: 自定义头像 URL（string, 可选）

#### Scenario: 渲染完整友链数据
- **WHEN** JSON 中存在包含 name、url、description、avatar 的记录
- **THEN** 卡片 SHALL 展示自定义头像、站名、描述，点击跳转至对应 URL

#### Scenario: 无自定义头像时的 fallback
- **WHEN** 友链记录未提供 avatar 字段
- **THEN** 系统 SHALL 使用站名首字母作为头像占位符

### Requirement: 友链卡片交互
友链卡片 SHALL 作为可点击的外部链接，在新标签页打开目标站点。

#### Scenario: 点击友链卡片
- **WHEN** 用户点击某个友链卡片
- **THEN** 浏览器 SHALL 在新标签页打开该站点 URL，链接包含 `rel="noopener noreferrer"`

#### Scenario: 悬停效果
- **WHEN** 用户鼠标悬停在友链卡片上
- **THEN** 卡片 SHALL 展示视觉反馈（背景色变化），与站内其他卡片交互风格一致

### Requirement: 导航集成
Friends 页面 SHALL 出现在侧边栏导航中，使用 Lucide 图标。

#### Scenario: 导航入口可见
- **WHEN** 用户查看侧边栏导航菜单
- **THEN** SHALL 在 Bookmarks 和 Musings 之间看到 "Friends" 导航项，带有对应图标

#### Scenario: 导航高亮
- **WHEN** 用户处于 `/friends` 页面
- **THEN** 侧边栏 "Friends" 导航项 SHALL 显示为激活状态
