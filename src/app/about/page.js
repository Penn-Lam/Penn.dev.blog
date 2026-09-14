/**
 * [INPUT]: 依赖 TRUST_PAGES 的真实个人资料与 TrustPage 页面框架
 * [OUTPUT]: 对外提供 /about 信任页及其 canonical metadata
 * [POS]: App Router 的静态个人背景页
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { TrustPage } from '@/components/trust-page'
import { TRUST_PAGES } from '@/data/site-content'

const page = TRUST_PAGES.about

export const metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: '/about' },
  openGraph: { title: page.title, description: page.description, url: '/about', type: 'profile' }
}

export default function AboutPage() {
  return <TrustPage page={page} />
}
