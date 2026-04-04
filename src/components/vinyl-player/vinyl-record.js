/**
 * [INPUT]: 接收 isPlaying、trackName、artistName、onClick props
 * [OUTPUT]: 对外提供 VinylRecord 纯展示组件
 * [POS]: vinyl-player 的视觉层，黑胶唱片 DOM 结构 + CSS 动画
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { memo } from 'react'

import styles from './vinyl-record.module.css'

export const VinylRecord = memo(({ isPlaying, coverUrl, onClick }) => {
  const animClass = isPlaying ? styles.spinning : isPlaying === false && onClick ? styles.stopping : ''
  const labelStyle = coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined
  const isInteractive = !!onClick

  return (
    <div
      className={`${styles.record} ${animClass}`}
      onClick={onClick}
      {...(isInteractive && { role: 'button', tabIndex: 0, 'aria-label': isPlaying ? '暂停音乐' : '播放音乐' })}
    >
      <div className={styles.label} style={labelStyle} />
      <div className={styles.spindle} />
    </div>
  )
})
VinylRecord.displayName = 'VinylRecord'
