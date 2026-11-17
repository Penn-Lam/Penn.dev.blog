import { hashString } from '@/lib/utils'

import { BookshelfRows } from './bookshelf-rows'
import { ShelfImage } from './shelf-image'
import { ShelfLink } from './shelf-link'
import styles from './shelves.module.css'

/**
 * [INPUT]: 依赖 ./bookshelf-rows 的 BookshelfRows（ul 外壳，处理邻居让位）；依赖 ./shelf-image 的 ShelfImage；依赖 ./shelf-link 的 ShelfLink；依赖 @/lib/utils 的 hashString；接收陈列条目数组
 * [OUTPUT]: 对外提供 Bookshelf 组件
 * [POS]: components/shelves 的书架，/bookmarks/books 用它。书封面朝外立在层板上，略微侧身，露出右侧的书页。
 *        页面上不印书名和作者，封面就是全部信息。没有封面的书渲染成一本印着书名的布面精装。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function Bookshelf({ items }) {
  return (
    <BookshelfRows>
      {items.map((item) => (
        <li key={item.id} className={styles.bookSlot}>
          <ShelfLink item={item} className={styles.book}>
            <ShelfImage
              src={item.cover}
              fallbackSrc={item.fallbackCover}
              className={styles.bookCover}
              fallback={
                <span className={styles.clothCover} style={{ '--cloth-hue': hashString(item.id) % 360 }}>
                  <b>{item.title}</b>
                  {item.subtitle && <i>{item.subtitle}</i>}
                </span>
              }
            />
          </ShelfLink>
        </li>
      ))}
    </BookshelfRows>
  )
}
