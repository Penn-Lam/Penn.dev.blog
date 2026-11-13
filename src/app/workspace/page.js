/**
 * [INPUT]: 依赖 @/components/workspace/desk-computer/desk-computer 的 DeskComputer 与 desk-stage.module.css；依赖 @/components/workspace 的 HardwareList、EasterEgg；依赖 @/data/workspace/hardware.json；依赖 @/lib/contentful 的 getPageSeo
 * [OUTPUT]: 默认导出 Workspace 页面、generateMetadata
 * [POS]: /workspace 路由。结构是标题、可交互的桌面电脑主视觉、设备清单三段。桌面电脑不加边框，宽度超出正文栏（见 desk-stage.module.css）。设备数据只在 hardware.json 维护。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { FloatingHeader } from '@/components/floating-header'
import { GradientBg4 } from '@/components/gradient-bg'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import DeskComputer from '@/components/workspace/desk-computer/desk-computer'
import deskStyles from '@/components/workspace/desk-stage.module.css'
import { EasterEgg } from '@/components/workspace/easter-egg'
import { HardwareList } from '@/components/workspace/hardware-list'
import hardwareData from '@/data/workspace/hardware.json'
import { getPageSeo } from '@/lib/contentful'
import { cx } from '@/utils/cx'

export default async function Workspace() {
  return (
    <ScrollArea>
      <GradientBg4 />
      <FloatingHeader title="Workspace" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Workspace" />
          <p className="text-text-secondary leading-relaxed">
            The machines I build on. The one below is from the late nineties and still works: click it, type, drag the
            mouse, load the CD.
          </p>
        </div>

        {/* 桌面电脑比正文栏宽：手机上贴到屏幕两边，桌面上最宽到 64rem */}
        <section className={cx(deskStyles.stage, '-mx-6 lg:mx-auto lg:w-full lg:max-w-5xl')}>
          <DeskComputer theme="light" />
        </section>

        <div className="content">
          <section>
            <h2 className="text-title-2-bold text-text-primary mb-6">On the desk</h2>
            <HardwareList items={hardwareData} />
          </section>
        </div>
      </div>

      <EasterEgg trigger="work hard" />
    </ScrollArea>
  )
}

export async function generateMetadata() {
  const seoData = await getPageSeo('workspace')

  const defaultMeta = {
    title: 'Workspace - Developer Portfolio & Projects',
    description:
      'Explore my digital workspace featuring current projects, development workflow, tools, and insights from my journey as a developer and researcher.',
    openGraph: {
      title: 'Workspace - Developer Portfolio & Projects',
      description:
        'Explore my digital workspace featuring current projects, development workflow, tools, and insights from my journey as a developer and researcher.',
      url: '/workspace',
      type: 'website'
    },
    alternates: {
      canonical: '/workspace'
    },
    keywords: ['developer workspace', 'projects', 'development workflow', 'coding tools', 'software development']
  }

  if (!seoData) {
    return defaultMeta
  }

  // 安全解构，避免 seo 为 undefined 或 null 时出错
  const seo = seoData.seo || {}
  const { title, description } = seo

  return {
    title: title || defaultMeta.title,
    description: description || defaultMeta.description,
    openGraph: {
      title: title || defaultMeta.openGraph.title,
      description: description || defaultMeta.openGraph.description,
      url: defaultMeta.openGraph.url,
      type: defaultMeta.openGraph.type
    },
    alternates: {
      canonical: defaultMeta.alternates.canonical
    },
    keywords: defaultMeta.keywords
  }
}
