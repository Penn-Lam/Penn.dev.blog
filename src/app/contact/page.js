/**
 * [INPUT]: 依赖 TRUST_PAGES 的已验证公开联络渠道与 TrustPage 页面框架
 * [OUTPUT]: 对外提供 /contact 信任页及其 canonical metadata
 * [POS]: App Router 的静态联络说明页
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { TrustPage } from '@/components/trust-page'
import { TRUST_PAGES } from '@/data/site-content'

const page = TRUST_PAGES.contact

export const metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: '/contact' },
  openGraph: { title: page.title, description: page.description, url: '/contact', type: 'website' }
}

export default function ContactPage() {
  return <TrustPage page={page} />
}
