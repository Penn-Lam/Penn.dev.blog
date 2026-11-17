'use client'

import { useRef, useState } from 'react'

import { NotionMentionLink } from '@/components/notion-mention-link'
import { cx } from '@/utils/cx'

import { CartridgePile } from './cartridge-pile'

/**
 * [INPUT]: 依赖 ./cartridge-pile 的 CartridgePile；依赖 @/components/notion-mention-link 的 NotionMentionLink；接收 tools.json 的一个分类（id、name、tools）
 * [OUTPUT]: 对外提供 CartridgeRack 组件
 * [POS]: components/stack 的分类区块。左边是工具清单（外链、说明），右边是同一批工具的一摞卡带。
 *        清单是信息本体，卡带是它的实物索引：指到清单某行，对应卡带抽出；点卡带，它立起来，清单对应行高亮。
 *        选中项、悬停项、键盘焦点项都记在这里。卡带画在画布上，画布不能获得焦点，所以每盘卡带另有一个只给键盘和读屏用的隐藏按钮。
 *        键盘：焦点在隐藏按钮上时，回车立起或放回，上下方向键换一盘，Esc 放回去；焦点项在清单对应行上显示焦点环。
 *        每个分类各自记一个选中项，分类之间互不影响。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function CartridgeRack({ category }) {
  const { id, name, tools } = category
  const buttonListRef = useRef(null)
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [peekSlug, setPeekSlug] = useState(null)
  const [focusSlug, setFocusSlug] = useState(null)
  const selectedIndex = tools.findIndex((tool) => tool.slug === selectedSlug)

  const toggle = (slug) => setSelectedSlug((current) => (current === slug ? null : slug))

  // 点画布里的卡带后把焦点交给它的隐藏按钮，接着就能用方向键换盘
  const handlePileSelect = (slug) => {
    toggle(slug)
    buttonListRef.current?.querySelector(`[data-slug="${slug}"]`)?.focus({ preventScroll: true })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') return setSelectedSlug(null)

    const direction = { ArrowDown: 1, ArrowUp: -1 }[event.key]

    if (!direction || selectedIndex < 0) return

    const nextIndex = (selectedIndex + direction + tools.length) % tools.length

    event.preventDefault()
    setSelectedSlug(tools[nextIndex].slug)
    event.currentTarget.querySelectorAll('button')[nextIndex]?.focus({ preventScroll: true })
  }

  const handleFocus = (event, slug) => {
    setPeekSlug(slug)
    setFocusSlug(event.target.matches(':focus-visible') ? slug : null)
  }

  const handleBlur = () => {
    setPeekSlug(null)
    setFocusSlug(null)
  }

  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <h2 className="text-title-2-bold text-text-primary mb-4">{name}</h2>
      <div className="grid gap-x-10 gap-y-2 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
        <ul className="order-2 flex flex-col md:order-1">
          {tools.map((tool) => (
            <li
              key={tool.slug}
              className={cx(
                '-mx-3 flex flex-col gap-1 rounded-xl px-3 py-3 transition-colors duration-200',
                tool.slug === selectedSlug && 'bg-background-secondary-default',
                tool.slug === focusSlug && 'ring-border-focus-ring ring-2'
              )}
              onMouseEnter={() => setPeekSlug(tool.slug)}
              onMouseLeave={() => setPeekSlug(null)}
            >
              <div>
                <NotionMentionLink url={tool.url}>{tool.name}</NotionMentionLink>
              </div>
              <p className="text-body-regular text-text-secondary px-1">{tool.desc}</p>
            </li>
          ))}
        </ul>

        <div className="relative order-1 md:order-2">
          <CartridgePile
            tools={tools}
            selectedSlug={selectedSlug}
            peekSlug={peekSlug}
            onPeek={setPeekSlug}
            onSelect={handlePileSelect}
          />
          <ol ref={buttonListRef} className="sr-only" aria-label={`${name} cartridges`} onKeyDown={handleKeyDown}>
            {tools.map((tool) => (
              <li key={tool.slug}>
                <button
                  type="button"
                  data-slug={tool.slug}
                  aria-pressed={tool.slug === selectedSlug}
                  aria-label={`${tool.name} cartridge`}
                  onClick={() => toggle(tool.slug)}
                  onFocus={(event) => handleFocus(event, tool.slug)}
                  onBlur={handleBlur}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
