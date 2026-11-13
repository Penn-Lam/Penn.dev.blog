import { hashString } from '@/lib/utils'

import styles from './cartridge.module.css'

/**
 * [INPUT]: 依赖 ./cartridge.module.css 的六面盒子样式；依赖 @/lib/utils 的 hashString；接收 tools.json 的单个工具（name、shell、label）
 * [OUTPUT]: 对外提供 Cartridge 组件、cartridgeRestPose 纯函数
 * [POS]: components/stack 的单盘卡带。只画形状：按钮里一层 .body（跟随指针倾斜），.body 里是外壳六个面、顶部模压的工具名、贴纸图。
 *        选中、悬停和让位由 CartridgeRack 通过父级 li 的 data 属性与 --shift 控制，本组件不持有状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const SIDE_FACES = ['back', 'top', 'bottom', 'left', 'right']

// 外壳亮度决定模压字用深色还是浅色
function shellInk(hex) {
  const value = parseInt(hex.slice(1), 16)
  const luminance = (0.299 * (value >> 16) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) / 255

  return luminance > 0.55 ? 'dark' : 'light'
}

/**
 * 由 slug 算出固定的静止姿态，服务端与客户端结果一致，不产生 hydration 差异。
 * @param {string} slug
 * @returns {{ tilt: number, dx: number }} tilt 单位为度，dx 单位为像素
 */
export function cartridgeRestPose(slug) {
  const seed = hashString(slug)

  return { tilt: (seed % 9) - 4, dx: ((seed >> 4) % 21) - 10 }
}

export function Cartridge({ tool, isSelected, ...props }) {
  const { tilt, dx } = cartridgeRestPose(tool.slug)

  return (
    <button
      type="button"
      className={styles.cart}
      data-ink={shellInk(tool.shell)}
      aria-pressed={isSelected}
      aria-label={`${tool.name} cartridge`}
      style={{ '--shell': tool.shell, '--tilt': `${tilt}deg`, '--dx': `${dx}px` }}
      {...props}
    >
      <span className={styles.body}>
        <span className={`${styles.face} ${styles.front}`}>
          <span className={styles.grip}>
            <span className={styles.name}>{tool.name}</span>
            <span className={styles.notches} aria-hidden>
              <i />
              <i />
            </span>
          </span>
          <span className={styles.label}>
            <img src={tool.label} alt="" width={480} height={320} loading="lazy" decoding="async" draggable={false} />
          </span>
        </span>
        {SIDE_FACES.map((side) => (
          <span key={side} className={`${styles.face} ${styles[side]}`} aria-hidden />
        ))}
      </span>
    </button>
  )
}
