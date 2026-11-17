'use client'

import { useRef } from 'react'

import styles from './shelves.module.css'

/**
 * [INPUT]: 依赖 react 的 useRef；依赖 ./shelves.module.css 的 .bookshelf、.book；子节点是 Bookshelf 渲染好的 li
 * [OUTPUT]: 对外提供 BookshelfRows 组件
 * [POS]: components/shelves 书架的 ul 外壳，只管一件事：一本书被抽出时，让它左右紧挨着的两本往外让。
 *        “紧挨着”必须在同一层板上。书架的列数随宽度变化，CSS 的相邻选择器分不清换行，会让上一层最后一本和下一层第一本也跟着动，
 *        所以这里比较两本书的纵向位置，同一层才给邻居打上 data-lean。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function BookshelfRows({ children }) {
  const leaningRef = useRef([])

  const straighten = () => {
    for (const slot of leaningRef.current) slot.removeAttribute('data-lean')
    leaningRef.current = []
  }

  const leanNeighbours = (event) => {
    const slot = event.target.closest(`.${styles.book}`)?.closest('li')

    straighten()

    if (!slot) return

    const neighbours = [
      [slot.previousElementSibling, 'left'],
      [slot.nextElementSibling, 'right']
    ]

    for (const [neighbour, side] of neighbours) {
      if (neighbour?.offsetTop !== slot.offsetTop) continue

      neighbour.setAttribute('data-lean', side)
      leaningRef.current.push(neighbour)
    }
  }

  return (
    <ul className={styles.bookshelf} onPointerOver={leanNeighbours} onPointerLeave={straighten}>
      {children}
    </ul>
  )
}
