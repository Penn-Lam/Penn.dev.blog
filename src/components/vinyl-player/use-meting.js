/**
 * [INPUT]: 依赖全局 APlayer + MetingJS 脚本（layout.js 中 next/script 加载）
 * [OUTPUT]: 对外提供 useMeting hook，暴露播放控制和状态
 * [POS]: vinyl-player 的音频数据层，桥接 MetingJS Web Component 与 React 状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export const PLAYLIST_ID = process.env.NEXT_PUBLIC_NETEASE_PLAYLIST_ID || '450272643'
const MAX_POLL_ATTEMPTS = 50 // 15s 超时（50 × 300ms）

/** 从 APlayer audios 数组提取 track 信息 */
const extractTrack = (audios, index) => {
  const t = audios?.[index]
  return t ? { name: t.name, artist: t.artist, cover: t.cover } : null
}

export function useMeting() {
  const containerRef = useRef(null)
  const aplayerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return

    const metingEl = containerRef.current.querySelector('meting-js')
    if (!metingEl) return

    let attempts = 0
    const poll = setInterval(() => {
      if (++attempts > MAX_POLL_ATTEMPTS) {
        clearInterval(poll)
        return
      }

      const ap = metingEl.aplayer
      if (!ap) return

      clearInterval(poll)
      aplayerRef.current = ap

      if (ap.list?.audios?.length > 0) {
        setCurrentTrack(extractTrack(ap.list.audios, ap.list.index))
      }

      const onPlay = () => setIsPlaying(true)
      const onPause = () => setIsPlaying(false)
      const onSwitch = (e) => setCurrentTrack(extractTrack(ap.list.audios, e.index))

      ap.on('play', onPlay)
      ap.on('pause', onPause)
      ap.on('listswitch', onSwitch)

      setIsReady(true)
    }, 300)

    return () => {
      clearInterval(poll)
      const ap = aplayerRef.current
      if (ap) {
        ap.off('play')
        ap.off('pause')
        ap.off('listswitch')
      }
    }
  }, [])

  const toggle = useCallback(() => aplayerRef.current?.toggle(), [])
  const next = useCallback(() => aplayerRef.current?.skipForward(), [])
  const prev = useCallback(() => aplayerRef.current?.skipBack(), [])

  return { containerRef, isReady, isPlaying, currentTrack, toggle, next, prev }
}
