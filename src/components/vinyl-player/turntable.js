'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'

import { IconButton } from '@/components/base/buttons/icon-button'
import { EjectIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@/components/icons'
import { NETEASE_PLAYLIST_ID } from '@/lib/constants'

import styles from './turntable.module.css'
import { useTurntable } from './turntable-context'
import { useMeting } from './use-meting'

/**
 * [INPUT]: 依赖 ./turntable-context 的 useTurntable；依赖 ./use-meting 的 useMeting；依赖 @/lib/constants 的 NETEASE_PLAYLIST_ID；依赖 next/script 按需加载 APlayer 与 MetingJS；依赖 BoardUI 的 IconButton；依赖 public/turntable 的 body.webp 与 arm.webp
 * [OUTPUT]: 对外提供 Turntable 组件
 * [POS]: vinyl-player 的唱机，放在 /bookmarks/music 顶部。外形是一台方形的浅灰唱机：居中的彩胶唱片、右上角的白色唱臂、左下角的音量旋钮。
 *        机身（含旋钮）和唱臂是设计稿导出的原图（public/turntable/），唱片、刻度和铭牌是这里画的，因为它们会变。
 *        唱机放的是站点的网易云歌单。架上的唱片是歌单里的歌：把一张拖上来（或点一下），唱机跳到那一首；歌单播到下一首时，转盘上的唱片跟着换。
 *        点唱片本身是播放/暂停，旋钮调音量。
 *        歌单从本站的 /api/playlist 取，不走 Meting 公共接口。某一首这位访客取不到音频时，播放器自己跳到下一首，这里把架上对应的那张记成不可播。
 *        播放脚本在第一次按播放或放上唱片之后才加载。离开页面时 <meting-js> 被卸载，声音随之停止。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const HOUSE_RECORD = {
  id: 'house',
  title: 'House playlist',
  // server、type、id 三项是 <meting-js> 走接口模式的开关；真正请求的是 api 指向的本站接口，它不看这三个参数
  audio: { server: 'netease', type: 'playlist', id: NETEASE_PLAYLIST_ID, api: '/api/playlist' }
}

// 机身和唱臂的出处。CC BY 4.0 要求署名并注明做过修改，所以页面上要留这一行
const DESIGN_CREDIT = {
  author: 'Lotta Anidi',
  source: 'https://www.figma.com/community/file/1650279101562799100/vinyl-player-component',
  license: 'https://creativecommons.org/licenses/by/4.0/'
}

const CREDIT_LINK_CLASS =
  'underline decoration-current/35 underline-offset-2 outline-none hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-border-focus-ring'

// 旋钮刻度：从正上方顺时针排到正右方，共 7 格
const KNOB_TICKS = [0, 1, 2, 3, 4, 5, 6]

const KNOB_SWEEP_DEGREES = 90

const DEFAULT_VOLUME = 0.7

const VOLUME_KEY_STEP = 0.05

// 拖动旋钮时，指针每移动这么多像素对应音量从 0 到 1
const VOLUME_DRAG_PIXELS = 120

const clampVolume = (value) => Math.max(0, Math.min(1, value))

function statusText({ isArmed, isReady, isPlaying, isSkipping, isRecordHeld }) {
  if (isRecordHeld) return 'Drop it on the turntable'

  if (isSkipping) return 'Not available here, skipping'

  if (isArmed && !isReady) return 'Cueing'

  if (isPlaying) return 'Playing'

  return isReady ? 'Paused' : 'Press play, or drag a record here'
}

export function Turntable() {
  const { platterRef, records, record, placeRecord, isRecordHeld, markUnplayable } = useTurntable()
  const [hasPressedPlay, setHasPressedPlay] = useState(false)
  const [isAPlayerReady, setIsAPlayerReady] = useState(false)
  const [isMetingReady, setIsMetingReady] = useState(false)
  const [volume, setVolumeLevel] = useState(DEFAULT_VOLUME)
  const knobDragRef = useRef(null)

  // 架上的唱片有两种：歌单里的一首歌（记着自己在歌单里的位置），或者自带音源的一张
  const playlistIndex = record?.audio?.playlistIndex ?? null
  const isPlaylistRecord = playlistIndex != null
  // 歌单里的歌不换音源，仍然放默认歌单，只是跳到那一首
  const current = record && !isPlaylistRecord ? record : HOUSE_RECORD
  const isArmed = hasPressedPlay || Boolean(record)

  const isHousePlaying = current === HOUSE_RECORD

  // 歌单里某一首取不到音频：架上有对应的唱片就记成不可播；自带音源的唱片记它自己
  const handleTrackError = useCallback(
    (index) => {
      const failed = isHousePlaying ? records?.find((item) => item.audio?.playlistIndex === index) : record

      if (failed) markUnplayable(failed.id)
    },
    [isHousePlaying, records, record, markUnplayable]
  )

  // 放上唱片就自动开始；退回默认歌单时不自动播放
  const {
    containerRef,
    isReady,
    isPlaying,
    isSkipping,
    currentTrack,
    currentIndex,
    toggle,
    next,
    prev,
    switchTo,
    setVolume
  } = useMeting(isArmed && isMetingReady, current.id, isArmed, playlistIndex, handleTrackError)

  const cover = (isPlaylistRecord ? currentTrack?.cover : null) ?? record?.cover ?? currentTrack?.cover

  // 放上一张歌单里的唱片：播放器已经在转，就直接跳到那一首
  useEffect(() => {
    if (isReady && isPlaylistRecord && playlistIndex !== currentIndex) switchTo(playlistIndex)
    // 只在换了唱片时触发；曲目自己往下走由下一个 effect 处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, playlistIndex])

  // 歌单自己播到了另一首（播完自动切，或按了上一首、下一首）：把架上对应的那张换到转盘上，原来那张回封套
  useEffect(() => {
    if (!isHousePlaying || currentIndex == null) return

    const playing = records?.find((item) => item.audio?.playlistIndex === currentIndex) ?? null

    if (playing?.id !== record?.id) placeRecord(playing)
    // 只跟随曲目位置的变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // 新的播放实例接管后，把旋钮当前的音量交给它
  useEffect(() => {
    if (isReady) setVolume(volume)
  }, [isReady, volume, setVolume])

  const handlePlay = () => (isReady ? toggle() : setHasPressedPlay(true))

  const handleEject = () => {
    setHasPressedPlay(false)
    placeRecord(null)
  }

  const handleKnobPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    knobDragRef.current = { x: event.clientX, y: event.clientY, volume }
  }

  const handleKnobPointerMove = (event) => {
    const start = knobDragRef.current

    if (!start) return

    // 往右或往上拖都是调大
    const travel = event.clientX - start.x + (start.y - event.clientY)

    setVolumeLevel(clampVolume(start.volume + travel / VOLUME_DRAG_PIXELS))
  }

  const handleKnobKeyDown = (event) => {
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key]

    if (!step) return

    event.preventDefault()
    setVolumeLevel((value) => clampVolume(value + step * VOLUME_KEY_STEP))
  }

  return (
    <div className={styles.deck} data-playing={isPlaying || undefined} data-wanting={isRecordHeld || undefined}>
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

      <div className={styles.unit} role="group" aria-label="Turntable">
        {/* 机身和唱臂是从设计稿里导出的原图，画布四周比机身多留 5% 给投影 */}
        <img className={styles.body} src="/turntable/body.webp" alt="" width={880} height={880} draggable={false} />
        <span className={styles.badge} aria-hidden>
          PENN
        </span>

        <button
          ref={platterRef}
          type="button"
          className={styles.record}
          onClick={handlePlay}
          disabled={isArmed && !isReady}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <span
            className={styles.spin}
            data-cover={cover ? '' : undefined}
            style={cover ? { '--cover': `url("${cover}")` } : undefined}
          >
            <span className={styles.label} />
          </span>
        </button>

        <img className={styles.arm} src="/turntable/arm.webp" alt="" width={880} height={880} draggable={false} />

        <div className={styles.knobArea}>
          {KNOB_TICKS.map((tick) => (
            <i
              key={tick}
              className={styles.tick}
              data-lit={tick / (KNOB_TICKS.length - 1) <= volume + 0.001 || undefined}
              style={{ '--angle': `${(tick / (KNOB_TICKS.length - 1)) * KNOB_SWEEP_DEGREES}deg` }}
            />
          ))}
          <button
            type="button"
            className={styles.knob}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
            style={{ '--turn': `${volume * KNOB_SWEEP_DEGREES}deg` }}
            onPointerDown={handleKnobPointerDown}
            onPointerMove={handleKnobPointerMove}
            onPointerUp={() => (knobDragRef.current = null)}
            onPointerCancel={() => (knobDragRef.current = null)}
            onKeyDown={handleKnobKeyDown}
          />
        </div>
      </div>

      <div className={styles.panel}>
        <div className="flex min-w-0 flex-col gap-1" aria-live="polite">
          <span className="text-title-3-semibold text-text-primary truncate">
            {currentTrack?.name ?? current.title}
          </span>
          <span className="text-body-2-regular text-text-secondary truncate">
            {statusText({ isArmed, isReady, isPlaying, isSkipping, isRecordHeld })}
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
            />
          )}
        </div>
        <p className="text-caption-1-regular text-text-tertiary">
          Turntable design by{' '}
          <a href={DESIGN_CREDIT.source} target="_blank" rel="noopener noreferrer" className={CREDIT_LINK_CLASS}>
            {DESIGN_CREDIT.author}
          </a>
          , adapted,{' '}
          <a href={DESIGN_CREDIT.license} target="_blank" rel="noopener noreferrer" className={CREDIT_LINK_CLASS}>
            CC BY 4.0
          </a>
        </p>
      </div>
    </div>
  )
}
