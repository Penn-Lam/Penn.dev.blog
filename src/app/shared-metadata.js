/**
 * [INPUT]: 无运行时依赖；图标文件来自 public/ 与 src/app/favicon.ico
 * [OUTPUT]: 对外提供 sharedMetadata（标题、描述、OG、icons），供 layout 与 manifest 共用
 * [POS]: app 根契约常量，站点名与图标清单的单一来源
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const sharedMetadata = {
  title: 'Penn Lam',
  description:
    'Shenzhen-based AI Infra Developer & technical founder, building agent memory infrastructure and next-gen AI-first social platforms with a hacker’s mindset.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pennlam.com',
  ogImage: {
    width: 1200,
    height: 630,
    type: 'image/png'
  },
  // favicon.ico 由 src/app/favicon.ico 文件约定注入，勿在此重复声明
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  }
}
