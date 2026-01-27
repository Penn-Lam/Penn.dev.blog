import '@/globals.css'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import classix from 'classix'
import { GeistMono } from 'geist/font/mono'
import { EyeIcon } from 'lucide-react'
import { LXGW_WenKai_TC } from 'next/font/google'
import localFont from 'next/font/local'
import { draftMode } from 'next/headers'
import Script from 'next/script'

import { sharedMetadata } from '@/app/shared-metadata'
import { ConsoleEasterEgg } from '@/components/console-easter-egg'
import { MenuContent } from '@/components/menu-content'
import { DialogStateProvider } from '@/components/quick-post-button'
import { SideMenu } from '@/components/side-menu'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { PROFILES } from '@/lib/constants'
import { preloadGetAllPosts } from '@/lib/contentful'

const iaWriterQuattroS = localFont({
  src: [
    { path: '../assets/fonts/iAWriterQuattroSRegular.ttf', weight: '400', style: 'normal' },
    { path: '../assets/fonts/iAWriterQuattroSItalic.ttf', weight: '400', style: 'italic' },
    { path: '../assets/fonts/iAWriterQuattroSBold.ttf', weight: '700', style: 'normal' },
    { path: '../assets/fonts/iAWriterQuattroSBoldItalic.ttf', weight: '700', style: 'italic' }
  ],
  variable: '--font-ia-writer-quattro-s',
  display: 'swap'
})

const fzPingXianYaSong = localFont({
  src: [{ path: '../assets/fonts/FZPingXianYaSong-Regular.ttf', weight: '400', style: 'normal' }],
  variable: '--font-fz-pingxian-yasong',
  display: 'swap'
})

const lxgwWenKai = LXGW_WenKai_TC({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lxgw-wenkai',
  display: 'swap'
})

export const fetchCache = 'default-cache'

export default async function RootLayout({ children }) {
  const { isEnabled } = await draftMode()
  preloadGetAllPosts(isEnabled)

  return (
    <html
      lang="en"
      data-theme="light"
      className={classix(GeistMono.variable, iaWriterQuattroS.variable, fzPingXianYaSong.variable, lxgwWenKai.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <DialogStateProvider>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <main vaul-drawer-wrapper="" className="min-h-screen bg-white">
              {isEnabled && (
                <div className="absolute inset-x-0 bottom-0 z-50 flex h-12 w-full items-center justify-center bg-green-500 text-center text-sm font-medium text-white">
                  <div className="flex items-center gap-2">
                    <EyeIcon size={16} />
                    <span>Draft mode is enabled</span>
                  </div>
                </div>
              )}
              <div className="lg:flex">
                <SideMenu className="relative hidden lg:flex">
                  <MenuContent />
                </SideMenu>
                <div className="flex flex-1">{children}</div>
              </div>
            </main>
            <Toaster />
            <TailwindIndicator />
            <ConsoleEasterEgg />
          </DialogStateProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-host={process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_HOST}
          data-token={process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pennlam.com'),
  robots: {
    index: true,
    follow: true
  },
  title: {
    default: sharedMetadata.title,
    template: `%s — ${sharedMetadata.title}`
  },
  description: sharedMetadata.description,
  keywords: ['Penn Lam', 'pennlam.com'],
  openGraph: {
    title: {
      default: sharedMetadata.title,
      template: `%s — ${sharedMetadata.title}`
    },
    description: sharedMetadata.description,
    alt: sharedMetadata.title,
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pennlam.com',
    siteName: sharedMetadata.title,
    locale: 'en_IE',
    images: [
      {
        url: '/opengraph-image',
        width: sharedMetadata.ogImage.width,
        height: sharedMetadata.ogImage.height,
        alt: sharedMetadata.title
      }
    ]
  },
  alternates: {
    canonical: '/'
  },
  twitter: {
    card: 'summary_large_image',
    site: `@${PROFILES.twitter.username}`,
    creator: `@${PROFILES.twitter.username}`,
    images: ['/opengraph-image']
  },
  other: {
    pinterest: 'nopin'
  }
}

export const viewport = {
  themeColor: 'white',
  colorScheme: 'only light',
  width: 'device-width',
  initialScale: 1
}
