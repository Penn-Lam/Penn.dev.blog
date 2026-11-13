import { PointerTilt } from '@/components/pointer-tilt'
import { Turntable } from '@/components/vinyl-player/turntable'
import { TurntableProvider } from '@/components/vinyl-player/turntable-context'
import { hashString } from '@/lib/utils'

import { RecordDisc } from './record-disc'
import { ShelfImage } from './shelf-image'
import { ShelfLink } from './shelf-link'
import styles from './shelves.module.css'

/**
 * [INPUT]: 依赖 @/components/vinyl-player 的 Turntable 与 TurntableProvider；依赖 ./record-disc 的 RecordDisc；依赖 @/components/pointer-tilt 的 PointerTilt；依赖 ./shelf-image、./shelf-link；依赖 @/lib/utils 的 hashString；接收陈列条目数组
 * [OUTPUT]: 对外提供 RecordShelf 组件
 * [POS]: components/shelves 的唱片架，/bookmarks/music 用它。顶部一台唱机，下面是唱片：方形封套，黑胶从右侧露出一截。
 *        封套是外链；黑胶是单独的一件，有音源的可以拖到唱机上播放。悬停时黑胶多滑出一截并转动，封套跟随指针倾斜。
 *        封套下面只有一行标题。没有封面的条目渲染成一张印着标题的素色封套。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function RecordShelf({ items }) {
  return (
    <TurntableProvider>
      <Turntable />
      <ul className={styles.crate}>
        {items.map((item) => (
          <PointerTilt as="li" key={item.id} className={styles.record}>
            <div className={styles.jacket}>
              <RecordDisc record={{ id: item.id, title: item.title, cover: item.cover, audio: item.audio }} />
              <ShelfLink item={item} className={styles.sleeve}>
                <ShelfImage
                  src={item.cover}
                  className={styles.sleeveArt}
                  fallback={
                    <span className={styles.plainSleeve} style={{ '--sleeve-hue': hashString(item.id) % 360 }}>
                      {item.title}
                    </span>
                  }
                />
              </ShelfLink>
            </div>
            <span className={styles.recordTitle}>{item.title}</span>
          </PointerTilt>
        ))}
      </ul>
    </TurntableProvider>
  )
}
