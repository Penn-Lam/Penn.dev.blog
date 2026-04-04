## Context

bookmarks 页面已有完整的 submit 模式：dialog/drawer 组件 + form + API route + 飞书多维表格。友链页面需要复用相同模式，但字段不同。

friends.json 字段：`name`、`url`、`avatar`、`github`、`signature`。

目标多维表格：`tblKaQnapdezW2xb`（与 bookmarks 同一个 app_token）。

## Goals / Non-Goals

**Goals:**
- 友链页面加 Submit 按钮，弹出 Dialog 表单
- 表单提交到 `/api/submit-friend`，写入飞书多维表格
- 复用现有 lark.js 的 `getLarkTenantToken` + `createBitableRecord`（传入不同 table_id）

**Non-Goals:**
- 不做 drawer（移动端适配），友链页面结构简单，dialog 够用
- 不做表单字段动态生成

## Decisions

### 1. 复用 lark.js，table_id 参数化
当前 `createBitableRecord` 从环境变量读 `LARK_BITABLE_TABLE_ID`。改为接受可选的 `tableId` 参数，不传则用默认值。这样 bookmarks 和 friends 共用一个函数。

### 2. 环境变量
只增加 `LARK_FRIENDS_TABLE_ID`，`app_token` 复用 `LARK_BITABLE_APP_TOKEN`（同一个多维表格应用）。

### 3. 组件结构
```
src/components/submit-friend/
  form.js    — 表单组件（name, url, avatar, github, signature）
  dialog.js  — Dialog 包装
```
不抽象通用 submit 组件——两个表单字段差异大，强行抽象反而增加复杂度。

### 4. 表单校验
- name: 必填，string
- url: 必填，合法 URL
- avatar: 可选，合法 URL
- github: 可选，string
- signature: 可选，string

## Risks / Trade-offs

- [字段名不匹配] → 需确保多维表格中字段名与代码一致（Name, URL, Avatar, GitHub, Signature, Date）
