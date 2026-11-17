/**
 * [INPUT]: 依赖 @contentful/rich-text-react-renderer 把富文本 JSON 转成 React 节点；依赖同目录的 latex-text、code-block、carousel、iframe 渲染各类内嵌条目
 * [OUTPUT]: 导出 RichText 组件、autolinkDocument 函数
 * [POS]: Contentful 富文本的唯一渲染器。文章页与 journey 页调用它。内嵌资源和条目按 id 从查询结果的 links 里查找；查询没有取回 links 时，对应节点不渲染。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import dynamic from 'next/dynamic'

import { LatexText } from '@/components/contentful/latex-text'
import { Link } from '@/components/link'
import { ShowInView } from '@/components/show-in-view'
import { splitTextByUrls } from '@/lib/url'

const TweetCard = dynamic(() => import('@/components/tweet-card/tweet-card').then((mod) => mod.TweetCard))

const CodeBlock = dynamic(() => import('@/components/contentful/code-block').then((mod) => mod.CodeBlock))

const DynamicIframe = dynamic(() => import('@/components/contentful/iframe').then((mod) => mod.Iframe))

import { dasherize } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @contentful/rich-text-react-renderer 的 documentToReactComponents；依赖 @/components/link 的 Link；依赖 @/lib/url 的 splitTextByUrls
 * [OUTPUT]: 对外提供 RichText 组件、autolinkDocument 纯函数
 * [POS]: components/contentful 的唯一富文本渲染器。writing、[slug] 页面与 JourneyCard 调用它。超链接节点交给 Link，外链由 Link 渲染成 NotionMentionLink。
 *        autoLink 默认关闭；只有 JourneyCard 打开它，把纯文本里的网址先改写成超链接节点再渲染。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 含 $ 或 \( \[ 的文本走 LatexText；autolink 也跳过这类文本，避免把公式切碎
const LATEX_PATTERN = /\$|\\[([)]/

// ==========================================================================
// 纯文本网址 → hyperlink 节点
// 跳过：已有链接内部（防止双重包裹）、标题（标题本身渲染成锚点）、行内代码、LaTeX 文本
// ==========================================================================

const NO_AUTOLINK_NODE_TYPES = new Set([
  INLINES.HYPERLINK,
  INLINES.ENTRY_HYPERLINK,
  INLINES.ASSET_HYPERLINK,
  INLINES.RESOURCE_HYPERLINK,
  BLOCKS.HEADING_1,
  BLOCKS.HEADING_2,
  BLOCKS.HEADING_3,
  BLOCKS.HEADING_4,
  BLOCKS.HEADING_5,
  BLOCKS.HEADING_6
])

function autolinkTextNode(node) {
  if (node.marks?.some((mark) => mark.type === MARKS.CODE) || LATEX_PATTERN.test(node.value)) return [node]

  const segments = splitTextByUrls(node.value)

  if (!segments.some((segment) => segment.type === 'url')) return [node]

  return segments.map((segment) =>
    segment.type === 'url'
      ? { nodeType: INLINES.HYPERLINK, data: { uri: segment.href }, content: [{ ...node, value: segment.value }] }
      : { ...node, value: segment.value }
  )
}

function autolinkNode(node, skip) {
  if (node.nodeType === 'text') return skip ? [node] : autolinkTextNode(node)

  if (!Array.isArray(node.content)) return [node]

  const skipChildren = skip || NO_AUTOLINK_NODE_TYPES.has(node.nodeType)

  return [{ ...node, content: node.content.flatMap((child) => autolinkNode(child, skipChildren)) }]
}

/**
 * 返回新的富文本文档，原文档不被修改。
 */
export function autolinkDocument(richTextDocument) {
  if (!richTextDocument) return richTextDocument

  return autolinkNode(richTextDocument, false)[0]
}

function options(links, { linkClassName } = {}) {
  const findAsset = (id) => links?.assets?.block?.find((item) => item.sys.id === id)
  const findBlockEntry = (id) => links?.entries?.block?.find((item) => item.sys.id === id)
  const findInlineEntry = (id) => links?.entries?.inline?.find((item) => item.sys.id === id)

  return {
    renderText: (text) => (LATEX_PATTERN.test(text) ? <LatexText text={text} /> : text),
    renderMark: {
      [MARKS.BOLD]: (text) => <span className="text-text-primary font-semibold">{text}</span>,
      [MARKS.ITALIC]: (text) => <span className="italic">{text}</span>,
      [MARKS.CODE]: (text) => <code className="inline-code">{text.props?.text ?? text}</code>
    },
    renderNode: {
      [BLOCKS.TABLE]: (_, children) => (
        <div
          role="region"
          aria-label="表格"
          tabIndex={0}
          className="focus-visible:ring-border-focus-ring mb-6 max-w-full overflow-x-auto focus-visible:ring-2 focus-visible:outline-none"
        >
          <table className="text-body-2-regular w-full min-w-96 border-collapse">
            <tbody>{children}</tbody>
          </table>
        </div>
      ),
      [BLOCKS.TABLE_ROW]: (_, children) => <tr>{children}</tr>,
      [BLOCKS.TABLE_HEADER_CELL]: (_, children) => (
        <th
          scope="col"
          className="border-border-table bg-background-secondary-default border px-3 py-2 text-left align-top"
        >
          {children}
        </th>
      ),
      [BLOCKS.TABLE_CELL]: (_, children) => (
        <td className="border-border-table border px-3 py-2 align-top">{children}</td>
      ),
      [BLOCKS.HEADING_2]: (_, children) => {
        const id = dasherize(children)
        const url = `h2-${id}`

        return (
          <h2
            id={url}
            className="group relative mt-6 mb-2 w-fit cursor-pointer before:absolute before:-left-4 hover:before:content-['#']"
          >
            <a href={`#${url}`} className="group-hover:underline group-hover:underline-offset-4">
              {children}
            </a>
          </h2>
        )
      },
      [BLOCKS.HEADING_3]: (_, children) => {
        const id = dasherize(children)
        const url = `h3-${id}`

        return (
          <h3
            id={url}
            className="group relative mt-6 mb-2 w-fit cursor-pointer before:absolute before:-left-4 hover:before:content-['#']"
          >
            <a href={`#${url}`} className="group-hover:underline group-hover:underline-offset-4">
              {children}
            </a>
          </h3>
        )
      },
      // Must be a <div> instead of <p> to avoid descendant issue, hence to avoid mismatching UI between server and client on hydration.
      [BLOCKS.PARAGRAPH]: (_, children) => (
        <div className="mb-4 leading-[1.75] last:mb-0 [&:has(+ul)]:mb-1">{children}</div>
      ),
      [BLOCKS.UL_LIST]: (_, children) => <ul className="mb-4 flex list-disc flex-col gap-0.5 pl-6">{children}</ul>,
      [BLOCKS.OL_LIST]: (_, children) => (
        <ol className="mb-4 flex list-inside list-[decimal-leading-zero] flex-col gap-2">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_, children) => <li>{children}</li>,
      [BLOCKS.QUOTE]: (_, children) => (
        <blockquote className="border-separator-border text-text-secondary mb-4 rounded-r-lg border-l-2 px-4 font-medium">
          {children}
        </blockquote>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const asset = findAsset(node.data.target.sys.id)

        if (!asset) return null
        const isEagerLoading = asset.contentfulMetadata?.tags?.some((tag) => tag.name === 'Eager Loading')

        return (
          <figure className="mb-6 flex flex-col items-center gap-2 overflow-hidden rounded-xl">
            <img
              src={asset.url}
              width={asset.width || 400}
              height={asset.height || 300}
              alt={asset.description || asset.title}
              loading={isEagerLoading ? 'eager' : 'lazy'}
              className="animate-reveal h-auto max-w-full"
              nopin="nopin"
            />
            {asset.description && (
              <figcaption className="text-caption-1-regular text-text-tertiary text-center break-all">
                {asset.description}
              </figcaption>
            )}
          </figure>
        )
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node) => {
        const entry = findBlockEntry(node.data.target.sys.id)

        if (entry?.__typename !== 'HtmlEmbed' || !/^\/embeds\/[a-z0-9-]+\.html$/.test(entry.htmlUrl)) return null

        return (
          <DynamicIframe
            embedUrl={entry.htmlUrl}
            title={entry.title}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            className="h-[70vh] min-h-96"
          />
        )
      },
      [BLOCKS.HR]: () => <hr className="my-12" />,
      [INLINES.HYPERLINK]: (node, children) => (
        <Link href={node.data.uri} className={linkClassName}>
          {children}
        </Link>
      ),
      [INLINES.EMBEDDED_ENTRY]: async (node) => {
        const entry = findInlineEntry(node.data.target.sys.id)

        // 查询没有取回这条内嵌条目（未取 links，或条目未发布）时不渲染，不让整页构建失败
        if (!entry) return null

        switch (entry.__typename) {
          case 'ContentEmbed': {
            const { embedUrl, title, type } = entry

            switch (type) {
              case 'Video': {
                const YouTubeEmbed = await import('@next/third-parties/google').then((mod) => mod.YouTubeEmbed)
                const videoId = embedUrl.split('/embed/')[1]

                return (
                  <ShowInView>
                    <YouTubeEmbed
                      videoid={videoId}
                      playlabel={title}
                      params="fs=0;controls=0&mute=1"
                      className="aspect-video"
                    />
                    {title && <div className="text-caption-1-regular text-text-tertiary py-2 text-center">{title}</div>}
                  </ShowInView>
                )
              }

              case 'SoundCloud': {
                return <DynamicIframe embedUrl={embedUrl} title={title} scrolling="no" className="h-[166px]" />
              }

              default:
                return null
            }
          }

          case 'CodeBlock': {
            return <CodeBlock {...entry} />
          }

          case 'Tweet': {
            const { id } = entry

            return <TweetCard id={id} />
          }

          case 'Carousel': {
            const Carousel = await import('@/components/contentful/carousel').then((mod) => mod.Carousel)

            return <Carousel images={entry.imagesCollection?.items} />
          }

          default:
            return null
        }
      }
    }
  }
}

export const RichText = ({ content, autoLink = false, linkClassName }) => {
  if (!content) return null

  const json = autoLink ? autolinkDocument(content.json) : content.json

  return documentToReactComponents(json, options(content.links, { linkClassName }))
}
