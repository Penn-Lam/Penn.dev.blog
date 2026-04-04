## Why

友链页面目前只有静态展示，没有提交入口。参照 bookmarks 页面的 submit 模式，让访客可以通过表单申请友链，数据写入飞书多维表格供审核。

## What Changes

- 友链页面增加 Submit 按钮 + Dialog 模态框
- 新建 `submit-friend` 组件（form + dialog），表单字段对应 friends.json 结构：name、url、avatar、github、signature
- 新建 API 路由 `POST /api/submit-friend`，复用现有的 isbot 检测、rate-limit、lark 鉴权逻辑，写入指定多维表格（app_token: `Zr3AbYe0AaR5aSsVVlncucWEn6f`，table_id: `tblKaQnapdezW2xb`）
- 新增环境变量 `LARK_FRIENDS_TABLE_ID`

## Capabilities

### New Capabilities
- `friend-submission`: 友链提交功能，包括前端表单、API 路由、飞书多维表格写入

### Modified Capabilities
（无）

## Impact

- `src/app/friends/page.js` — 引入 Submit 按钮
- `src/components/submit-friend/` — 新建 form.js、dialog.js
- `src/app/api/submit-friend/route.js` — 新建 API 路由
- `.env.example` — 新增 `LARK_FRIENDS_TABLE_ID`
- 飞书多维表格需创建字段：Name、URL、Avatar、GitHub、Signature、Date
