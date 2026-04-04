## 1. 飞书 API 工具函数

- [x] 1.1 创建 `src/lib/lark.js`，实现 `getLarkTenantToken()` 函数：POST 飞书 auth API 获取 tenant_access_token
- [x] 1.2 在 `src/lib/lark.js` 中实现 `createBitableRecord(token, fields)` 函数：POST 多维表格 records API 写入一条记录

## 2. 替换 API 路由

- [x] 2.1 修改 `src/app/api/submit-bookmark/route.js`：移除 Airtable 调用，改为调用 `getLarkTenantToken()` + `createBitableRecord()`
- [x] 2.2 更新字段映射：`{ URL: url, Email: email, Date: Date.now(), Type: type || "Other" }`
- [x] 2.3 保留现有的 isbot 检测和 rate-limit 逻辑不变

## 3. 清理与配置

- [x] 3.1 更新 `.env.example`（如有）：移除 `AIRTABLE_*`，添加 `LARK_APP_ID`、`LARK_APP_SECRET`、`LARK_BITABLE_APP_TOKEN`、`LARK_BITABLE_TABLE_ID`
- [x] 3.2 移除不再需要的 Airtable 相关依赖（如有单独安装的包）— 无需操作，无独立 Airtable 包
- [x] 3.3 更新 L3 文件头部注释，检查 CLAUDE.md 文档同构
