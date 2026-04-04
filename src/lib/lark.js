/**
 * [INPUT]: 依赖飞书开放平台 REST API（auth + bitable）
 * [OUTPUT]: 对外提供 getLarkTenantToken, createBitableRecord
 * [POS]: lib 的飞书 API 工具模块，供 submit-bookmark / submit-friend 路由调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const LARK_BASE_URL = 'https://open.feishu.cn/open-apis'

/** 获取飞书 tenant_access_token */
export async function getLarkTenantToken() {
  const res = await fetch(`${LARK_BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET
    })
  })

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`Lark auth failed: ${data.msg}`)
  }
  return data.tenant_access_token
}

/** 向多维表格写入一条记录，tableId 可选，不传用默认值 */
export async function createBitableRecord(token, fields, { tableId } = {}) {
  const appToken = process.env.LARK_BITABLE_APP_TOKEN
  const table = tableId || process.env.LARK_BITABLE_TABLE_ID

  const res = await fetch(`${LARK_BASE_URL}/bitable/v1/apps/${appToken}/tables/${table}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ fields })
  })

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`Lark bitable write failed: ${data.msg}`)
  }
  return data.data
}
