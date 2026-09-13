import { FloatingHeader } from '@/components/floating-header'
import { GradientBg5 } from '@/components/gradient-bg'
import { MusingsList } from '@/components/musings-list'
import { PageTitle } from '@/components/page-title'
import { QuickPostButton } from '@/components/quick-post-button'
import { ScrollArea } from '@/components/scroll-area'

async function getMusings() {
  try {
    // 首先尝试从GitHub获取真实数据
    const response = await fetch('https://raw.githubusercontent.com/Penn-Lam/git-thoughts/main/public/issues.json', {
      next: { revalidate: 86400 } // 24小时重新验证 (86400秒)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const musings = await response.json()

    return musings
  } catch (error) {
    console.error('Failed to fetch musings from GitHub:', error)

    // 如果GitHub数据获取失败，在开发环境中使用测试数据作为fallback
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const testDataPath = path.join(process.cwd(), 'public', 'test-musings.json')
        const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'))
        console.info('Using test data as fallback')

        return testData
      } catch (testError) {
        console.error('Failed to load test data:', testError)
      }
    }

    return null
  }
}

export default async function MusingsPage({ searchParams }) {
  const musings = await getMusings()
  const params = await searchParams
  const selectedTag = params?.tag

  if (musings === null) {
    return (
      <ScrollArea useScrollAreaId>
        <GradientBg5 />
        <FloatingHeader scrollTitle="Musings" />
        <div className="content-wrapper">
          <div className="content">
            <PageTitle title="Musings" className="lg:hidden" />
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-text-secondary">Thoughts and reflections, powered by GitHub Issues</p>
                <p className="text-caption-1-regular text-text-tertiary mt-1">
                  Learn more:{' '}
                  <a
                    href="https://github.com/Penn-Lam/git-thoughts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    git-thoughts
                  </a>
                </p>
              </div>
              <QuickPostButton />
            </div>
            <div className="border-separator-border bg-background-primary-default rounded-2xl border py-16 text-center">
              <p className="text-text-tertiary">Unable to load musings</p>
              <p className="text-body-regular text-text-placeholder mt-1">Please try again later</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea useScrollAreaId>
      <GradientBg5 />
      <FloatingHeader scrollTitle="Musings" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Musings" className="lg:hidden" />
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-text-secondary">Thoughts and reflections, powered by GitHub Issues</p>
              <p className="text-caption-1-regular text-text-tertiary mt-1">
                Learn more:{' '}
                <a
                  href="https://github.com/Penn-Lam/git-thoughts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  git-thoughts
                </a>
              </p>
            </div>
            <QuickPostButton />
          </div>

          <MusingsList musings={musings} selectedTag={selectedTag} />
        </div>
      </div>
    </ScrollArea>
  )
}

export const metadata = {
  title: 'Musings',
  description: 'Thoughts and reflections powered by GitHub Issues'
}

// 确保页面使用 ISR
export const revalidate = 3600 // 1小时 (3600秒)
