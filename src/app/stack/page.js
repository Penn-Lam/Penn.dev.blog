/**
 * [INPUT]: 依赖 @/components/stack/cartridge-rack 的 CartridgeRack；依赖 @/components/easter-egg 的 EasterEgg；依赖 @/data/tools.json；依赖 @/lib/contentful 的 getPageSeo
 * [OUTPUT]: 默认导出 StackPage 页面、generateMetadata
 * [POS]: /stack 路由。每个工具分类渲染成一个 CartridgeRack（清单 + 一摞卡带）。工具数据只在 tools.json 维护，卡带贴纸在 public/stack/labels。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { EasterEgg } from '@/components/easter-egg'
import { FloatingHeader } from '@/components/floating-header'
import { GradientBg4 } from '@/components/gradient-bg'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { CartridgeRack } from '@/components/stack/cartridge-rack'
import toolsData from '@/data/tools.json'
import { getPageSeo } from '@/lib/contentful'

export default async function StackPage() {
  return (
    <ScrollArea>
      <GradientBg4 />
      <FloatingHeader title="Stack" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Stack" />

          <p className="text-text-secondary mb-2 leading-relaxed">
            The tools I plug in every day. Each one has been battle-tested in real workflows. Pick up a cartridge to
            look at it.
          </p>

          <p className="text-body-regular text-text-tertiary mb-12">
            Try the <span className="text-caption-1-regular font-mono">↑ ↑ ↓ ↓ ← → ← →</span> sequence
          </p>

          {toolsData.categories.map((category) => (
            <CartridgeRack key={category.id} category={category} />
          ))}

          <EasterEgg tools={toolsData.categories} />
        </div>
      </div>
    </ScrollArea>
  )
}

export async function generateMetadata() {
  const seoData = await getPageSeo('stack')

  if (!seoData) {
    return {
      title: 'Stack',
      description: 'My curated collection of daily tools and productivity boosters',
      openGraph: {
        title: 'Stack',
        description: 'My curated collection of daily tools and productivity boosters',
        url: '/stack'
      },
      alternates: {
        canonical: '/stack'
      }
    }
  }

  const seo = seoData.seo || {}
  const { title, description } = seo
  const siteUrl = '/stack'

  return {
    title: title || 'Stack',
    description: description || 'My curated collection of daily tools and productivity boosters',
    openGraph: {
      title: title || 'Stack',
      description: description || 'My curated collection of daily tools and productivity boosters',
      url: siteUrl
    },
    alternates: {
      canonical: siteUrl
    }
  }
}
