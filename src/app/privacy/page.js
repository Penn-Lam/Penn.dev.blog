/**
 * [INPUT]: 依赖 TRUST_PAGES 的站点数据处理说明与 TrustPage 页面框架
 * [OUTPUT]: 对外提供 /privacy 信任页及其 canonical metadata
 * [POS]: App Router 的静态隐私说明页
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { TrustPage } from '@/components/trust-page'
import { TRUST_PAGES } from '@/data/site-content'

const page = TRUST_PAGES.privacy

export const metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: '/privacy' },
  openGraph: { title: page.title, description: page.description, url: '/privacy', type: 'website' }
}

export default function PrivacyPage() {
  return <TrustPage page={page} />
}
