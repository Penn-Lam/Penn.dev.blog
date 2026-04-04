## Context

当前 `src/app/api/submit-bookmark/route.js` 通过 Airtable REST API 存储用户提交的书签。需要迁移到飞书多维表格（Lark Bitable），使用飞书开放平台 API。

飞书 API 鉴权模型：自建应用通过 `app_id` + `app_secret` 获取 `tenant_access_token`（有效期 2 小时），再用 token 调用业务 API。

## Goals / Non-Goals

**Goals:**
- 将存储后端从 Airtable 替换为飞书多维表格
- 保持前端表单行为不变（URL、Email、Type 三个字段）
- 保持现有的限流和 bot 检测逻辑

**Non-Goals:**
- 不做 token 缓存（调用量极低，每次请求获取新 token 即可）
- 不改前端任何代码
- 不做飞书 SDK 集成（直接 fetch 即可）

## Decisions

### 1. 直接 fetch 而非使用飞书 SDK
飞书有官方 Node SDK，但本项目只需要一个 POST 写入操作。引入 SDK 增加依赖体积，fetch 两次调用（获取 token + 写入记录）更简洁。

### 2. 不缓存 tenant_access_token
token 有效期 2h，但书签提交是低频操作（每天几次）。缓存引入状态管理复杂度，不值得。每次提交多一次 auth 请求，延迟可忽略。

### 3. 环境变量命名
```
LARK_APP_ID          — 飞书自建应用 App ID
LARK_APP_SECRET      — 飞书自建应用 App Secret
LARK_BITABLE_APP_TOKEN — 多维表格 app_token
LARK_BITABLE_TABLE_ID  — 数据表 table_id
```

### 4. 字段映射
| 前端字段 | 多维表格字段名 | 字段类型 |
|---------|-------------|---------|
| url     | URL         | 文本     |
| email   | Email       | 文本     |
| (auto)  | Date        | 日期时间  |
| type    | Type        | 文本     |

多维表格的 fields 是 key-value 对象，key 为字段名，value 为对应类型的值。日期字段需传毫秒时间戳。

## Risks / Trade-offs

- [飞书 API 故障] → 与 Airtable 风险等价，无额外缓解措施
- [token 获取失败] → 返回 500，前端已有 retry 机制
- [字段名不匹配] → 需确保多维表格中的字段名与代码中一致，部署前手动验证
