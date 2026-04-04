## Why

当前书签提交功能使用 Airtable 作为存储后端，需要迁移到飞书多维表格（Lark Bitable）。Airtable 不再使用，统一到飞书生态。

## What Changes

- **BREAKING**: 移除 Airtable API 调用，替换为飞书多维表格 API
- 新增飞书 tenant_access_token 获取逻辑（`app_id` + `app_secret` → token）
- 调用 `POST /bitable/v1/apps/{app_token}/tables/{table_id}/records` 写入记录
- 环境变量从 `AIRTABLE_*` 替换为 `LARK_*`（`LARK_APP_ID`, `LARK_APP_SECRET`, `LARK_BITABLE_APP_TOKEN`, `LARK_BITABLE_TABLE_ID`）
- 移除 `@arcjet/ip` 依赖（如仅用于 Airtable 限流场景）

## Capabilities

### New Capabilities
- `lark-bitable-integration`: 飞书多维表格 API 集成，包括鉴权和记录创建

### Modified Capabilities
（无已有 spec 需修改）

## Impact

- `src/app/api/submit-bookmark/route.js` — 核心变更文件，API 调用全部替换
- 环境变量 — Vercel 生产环境需配置新的 `LARK_*` 变量
- 依赖 — 无需新增 npm 包，直接 fetch 调用飞书 REST API
- 多维表格需预建字段：URL（文本）、Email（文本）、Date（日期）、Type（文本/单选）
