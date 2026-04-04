## 1. lark.js 参数化

- [x] 1.1 修改 `src/lib/lark.js` 的 `createBitableRecord`，接受可选的 `tableId` 参数，不传时用 `LARK_BITABLE_TABLE_ID`

## 2. 友链提交组件

- [x] 2.1 创建 `src/components/submit-friend/form.js`：表单组件（name、url、avatar、github、signature），zod 校验，POST `/api/submit-friend`
- [x] 2.2 创建 `src/components/submit-friend/dialog.js`：Dialog 包装组件
- [x] 2.3 在 `src/app/friends/page.js` 中引入 Submit 按钮和 Dialog

## 3. API 路由

- [x] 3.1 创建 `src/app/api/submit-friend/route.js`：zod 校验 + isbot + rate-limit + 调用 lark 写入 `LARK_FRIENDS_TABLE_ID`
- [x] 3.2 通过飞书 API 创建多维表格字段（Name、URL、Avatar、GitHub、Signature、Date）

## 4. 配置

- [x] 4.1 更新 `.env.example`：新增 `LARK_FRIENDS_TABLE_ID`
- [x] 4.2 更新 L3 文件头部注释
