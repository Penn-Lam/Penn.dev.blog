## ADDED Requirements

### Requirement: 获取飞书 tenant_access_token
系统 SHALL 通过 POST `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal` 获取 tenant_access_token，请求体为 `{ app_id, app_secret }`。

#### Scenario: 成功获取 token
- **WHEN** 使用有效的 `LARK_APP_ID` 和 `LARK_APP_SECRET` 请求 token
- **THEN** 返回 `{ code: 0, tenant_access_token: "...", expire: 7200 }`

#### Scenario: 凭证无效
- **WHEN** `app_id` 或 `app_secret` 无效
- **THEN** 返回非零 code，API 路由 SHALL 返回 500 错误

### Requirement: 向多维表格写入书签记录
系统 SHALL 通过 POST `https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records` 创建记录，请求头携带 `Authorization: Bearer {tenant_access_token}`。

#### Scenario: 成功写入记录
- **WHEN** 提交有效的书签数据 `{ url, email, type }`
- **THEN** 系统向多维表格写入一条记录，fields 为 `{ URL: url, Email: email, Date: 当前毫秒时间戳, Type: type || "Other" }`
- **THEN** API 返回 200 和写入结果

#### Scenario: 写入失败
- **WHEN** 多维表格 API 返回错误（code 非 0）
- **THEN** API 路由 SHALL 返回 500，body 包含 `{ error: "Error submitting bookmark." }`

### Requirement: 环境变量配置
系统 SHALL 从环境变量读取飞书配置：`LARK_APP_ID`、`LARK_APP_SECRET`、`LARK_BITABLE_APP_TOKEN`、`LARK_BITABLE_TABLE_ID`。

#### Scenario: 环境变量就绪
- **WHEN** 所有 4 个环境变量已配置
- **THEN** API 正常工作

### Requirement: 保持现有安全机制
系统 SHALL 保留现有的 bot 检测（isbot）和 IP 限流（rate-limit）逻辑不变。

#### Scenario: Bot 请求被拒
- **WHEN** User-Agent 为 bot
- **THEN** 返回 403

#### Scenario: 超过速率限制
- **WHEN** 同一 IP 10 分钟内超过 5 次请求
- **THEN** 返回 429

## REMOVED Requirements

### Requirement: Airtable API 集成
**Reason**: 存储后端迁移到飞书多维表格
**Migration**: 使用飞书 Bitable API 替代，环境变量从 `AIRTABLE_*` 改为 `LARK_*`
