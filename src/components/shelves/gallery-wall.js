import { PointerTilt } from '@/components/pointer-tilt'
import { hashString } from '@/lib/utils'

import { ShelfImage } from './shelf-image'
import { ShelfLink } from './shelf-link'
import styles from './shelves.module.css'

/**
 * [INPUT]: 依赖 @/components/pointer-tilt 的 PointerTilt；依赖 ./shelf-image 的 ShelfImage；依赖 ./shelf-link 的 ShelfLink；依赖 @/lib/utils 的 hashString；接收陈列条目数组
 * [OUTPUT]: 对外提供 GalleryWall 组件
 * [POS]: components/shelves 的画廊墙，/bookmarks/art 用它。每件作品是一幅挂在钉子上的画：挂线、画框、卡纸、画芯，下面一块只写标题的展签。
 *        三层各管一件事：li 记指针位置；链接是“挂着的那一整件”，绕钉子摆动；画框跟随指针倾斜，玻璃上的高光随之移动。
 *        画框的木色和挂歪的角度由条目 id 派生，每次渲染都一样。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const FRAME_FINISHES = ['walnut', 'black', 'oak', 'white']

export function GalleryWall({ items }) {
  return (
    <ul className={styles.wall}>
      {items.map((item) => {
        const seed = hashString(item.id)

        return (
          <PointerTilt
            as="li"
            key={item.id}
            className={styles.hang}
            style={{ '--tilt': `${((seed >> 3) % 5) * 0.5 - 1}deg` }}
          >
            <ShelfLink item={item} className={styles.hanger}>
              <span className={`${styles.frame} ${styles[FRAME_FINISHES[seed % FRAME_FINISHES.length]]}`}>
                <span className={styles.mat}>
                  <ShelfImage
                    src={item.cover}
                    width={item.width}
                    height={item.height}
                    className={styles.art}
                    fallback={<span className={styles.blankArt}>{item.title}</span>}
                  />
                </span>
              </span>
            </ShelfLink>
            <span className={styles.plaque}>{item.title}</span>
          </PointerTilt>
        )
      })}
    </ul>
  )
}
