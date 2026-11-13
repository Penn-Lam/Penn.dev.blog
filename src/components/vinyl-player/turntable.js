'use client'

import Script from 'next/script'
import { useState } from 'react'

import { IconButton } from '@/components/base/buttons/icon-button'
import { EjectIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@/components/icons'

import styles from './turntable.module.css'
import { useTurntable } from './turntable-context'
import { PLAYLIST_ID, useMeting } from './use-meting'
import { VinylRecord } from './vinyl-record'

/**
 * [INPUT]: 依赖 ./turntable-context 的 useTurntable；依赖 ./use-meting 的 useMeting 与 PLAYLIST_ID；依赖 ./vinyl-record 的 VinylRecord；依赖 next/script 按需加载 APlayer 与 MetingJS；依赖 BoardUI 的 IconButton
 * [OUTPUT]: 对外提供 Turntable 组件
 * [POS]: vinyl-player 的唱机，放在 /bookmarks/music 顶部。转盘上默认是站点歌单；把唱片架上的唱片拖上来（或点一下），就换成那张唱片并开始播放。
 *        播放脚本在第一次按播放或放上唱片之后才加载。离开页面时 <meting-js> 被卸载，声音随之停止。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const HOUSE_RECORD = {
  id: 'house',
  title: 'House playlist',
  audio: { server: 'netease', type: 'playlist', id: PLAYLIST_ID }
}

function readoutStatus({ isArmed, isReady, isPlaying, isRecordHeld }) {
  if (isRecordHeld) return 'Drop it on the platter'

  if (isArmed && !isReady) return 'Cueing'

  if (isPlaying) return 'Playing'

  return isReady ? 'Paused' : 'Press play, or drag a record here'
}

export function Turntable() {
  const { platterRef, record, placeRecord, isRecordHeld } = useTurntable()
  const [hasPressedPlay, setHasPressedPlay] = useState(false)
  const [isAPlayerReady, setIsAPlayerReady] = useState(false)
  const [isMetingReady, setIsMetingReady] = useState(false)

  const current = record ?? HOUSE_RECORD
  const isArmed = hasPressedPlay || Boolean(record)

  // 放上唱片就自动开始；退回默认歌单时不自动播放
  const { containerRef, isReady, isPlaying, currentTrack, toggle, next, prev } = useMeting(
    isArmed && isMetingReady,
    current.id,
    hasPressedPlay || Boolean(record)
  )

  const handlePlay = () => (isReady ? toggle() : setHasPressedPlay(true))

  const handleEject = () => {
    setHasPressedPlay(false)
    placeRecord(null)
  }

  return (
    <div
      className={styles.deck}
      data-playing={isPlaying || undefined}
      data-wanting={isRecordHeld || undefined}
      role="group"
      aria-label="Turntable"
    >
      {isArmed ? (
        <Script
          src="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js"
          strategy="afterInteractive"
          onReady={() => setIsAPlayerReady(true)}
        />
      ) : null}
      {isArmed && isAPlayerReady ? (
        <Script
          src="https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js"
          strategy="afterInteractive"
          onReady={() => setIsMetingReady(true)}
        />
      ) : null}
      {isArmed && isMetingReady ? (
        <div ref={containerRef} className="pointer-events-none fixed -left-[9999px] opacity-0">
          <meting-js key={current.id} {...current.audio} preload="none" />
        </div>
      ) : null}

      <div className={styles.well}>
        <div ref={platterRef} className={styles.platter}>
          <div className={styles.spin}>
            <VinylRecord coverUrl={record?.cover ?? currentTrack?.cover} />
          </div>
        </div>
        <div className={styles.arm} aria-hidden>
          <span className={styles.armRod} />
          <span className={styles.armHead} />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.readout} aria-live="polite">
          <span className={styles.readoutTitle}>{currentTrack?.name ?? current.title}</span>
          <span className={styles.readoutStatus}>
            {readoutStatus({ isArmed, isReady, isPlaying, isRecordHeld })}
            {currentTrack?.artist ? ` · ${currentTrack.artist}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={SkipBackIcon} size="small" aria-label="Previous track" onClick={prev} disabled={!isReady} />
          <IconButton
            icon={isPlaying ? PauseIcon : PlayIcon}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={handlePlay}
            disabled={isArmed && !isReady}
          />
          <IconButton icon={SkipForwardIcon} size="small" aria-label="Next track" onClick={next} disabled={!isReady} />
          {record && (
            <IconButton
              icon={EjectIcon}
              size="small"
              aria-label={`Put ${record.title} back in its sleeve`}
              onClick={handleEject}
              className="ml-auto"
            />
          )}
        </div>
      </div>
    </div>
  )
}
