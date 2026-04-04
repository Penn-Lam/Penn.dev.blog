## ADDED Requirements

### Requirement: 友链提交表单
系统 SHALL 在友链页面提供 Submit 按钮，点击后弹出 Dialog 表单，包含字段：Name（必填）、URL（必填）、Avatar（可选）、GitHub（可选）、Signature（可选）。

#### Scenario: 成功提交友链
- **WHEN** 用户填写 Name 和 URL 并点击 Submit
- **THEN** 系统 POST `/api/submit-friend`，成功后显示 toast 并关闭 dialog

#### Scenario: 表单验证失败
- **WHEN** 用户未填写 Name 或 URL 格式无效
- **THEN** 表单显示对应字段的错误提示，不发送请求

### Requirement: 友链提交 API
系统 SHALL 提供 `POST /api/submit-friend` 端点，接收 `{ name, url, avatar, github, signature }`，写入飞书多维表格。

#### Scenario: 成功写入多维表格
- **WHEN** 提交有效数据
- **THEN** 向 `LARK_FRIENDS_TABLE_ID` 对应的表写入记录：`{ Name, URL, Avatar, GitHub, Signature, Date: 当前毫秒时间戳 }`
- **THEN** 返回 200

#### Scenario: Bot 请求被拒
- **WHEN** User-Agent 为 bot
- **THEN** 返回 403

#### Scenario: 超过速率限制
- **WHEN** 同一 IP 10 分钟内超过 5 次请求
- **THEN** 返回 429

### Requirement: lark.js 参数化 table_id
`createBitableRecord` SHALL 接受可选的 `tableId` 参数，不传时使用 `LARK_BITABLE_TABLE_ID` 默认值。

#### Scenario: 使用自定义 table_id
- **WHEN** 调用 `createBitableRecord(token, fields, { tableId: 'tblXXX' })`
- **THEN** 写入指定的表

#### Scenario: 使用默认 table_id
- **WHEN** 调用 `createBitableRecord(token, fields)` 不传 tableId
- **THEN** 写入 `LARK_BITABLE_TABLE_ID` 对应的表
