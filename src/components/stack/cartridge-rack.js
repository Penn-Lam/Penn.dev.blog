'use client'

import { useState } from 'react'

import { NotionMentionLink } from '@/components/notion-mention-link'
import { PointerTilt } from '@/components/pointer-tilt'
import { cx } from '@/utils/cx'

import { Cartridge } from './cartridge'
import styles from './cartridge.module.css'

/**
 * [INPUT]: 依赖 ./cartridge 的 Cartridge；依赖 @/components/pointer-tilt 的 PointerTilt；依赖 @/components/notion-mention-link 的 NotionMentionLink；接收 tools.json 的一个分类（id、name、tools）
 * [OUTPUT]: 对外提供 CartridgeRack 组件
 * [POS]: components/stack 的分类区块。左边是工具清单（外链、说明），右边是同一批工具的一摞卡带。
 *        清单是信息本体，卡带是它的实物索引：指到清单某行，对应卡带抽出；点卡带，它立起来，清单对应行高亮。
 *        键盘：焦点在卡带上时，上下方向键换一盘，Esc 放回去。
 *        每个分类各自记一个选中项，分类之间互不影响。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function CartridgeRack({ category }) {
  const { id, name, tools } = category
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [peekSlug, setPeekSlug] = useState(null)
  const selectedIndex = tools.findIndex((tool) => tool.slug === selectedSlug)

  const handlePileKeyDown = (event) => {
    if (event.key === 'Escape') return setSelectedSlug(null)

    const direction = { ArrowDown: 1, ArrowUp: -1 }[event.key]

    if (!direction || selectedIndex < 0) return

    const nextIndex = (selectedIndex + direction + tools.length) % tools.length

    event.preventDefault()
    setSelectedSlug(tools[nextIndex].slug)
    event.currentTarget.querySelectorAll('button')[nextIndex]?.focus()
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
                tool.slug === selectedSlug && 'bg-background-secondary-default'
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

        <ol
          className={cx(styles.pile, 'order-1 md:order-2')}
          aria-label={`${name} cartridges`}
          onKeyDown={handlePileKeyDown}
        >
          {tools.map((tool, index) => {
            const isSelected = index === selectedIndex
            const shift = selectedIndex < 0 || isSelected ? 0 : index < selectedIndex ? -1 : 1

            return (
              <PointerTilt
                as="li"
                key={tool.slug}
                className={styles.slot}
                data-selected={isSelected || undefined}
                data-peek={(!isSelected && tool.slug === peekSlug) || undefined}
                style={{
                  '--shift': shift,
                  '--i': tools.length - 1 - index,
                  zIndex: isSelected ? tools.length + 1 : tools.length - index
                }}
              >
                <Cartridge
                  tool={tool}
                  isSelected={isSelected}
                  onClick={() => setSelectedSlug(isSelected ? null : tool.slug)}
                  onMouseEnter={() => setPeekSlug(tool.slug)}
                  onMouseLeave={() => setPeekSlug(null)}
                  onFocus={() => setPeekSlug(tool.slug)}
                  onBlur={() => setPeekSlug(null)}
                />
              </PointerTilt>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
