/**
 * [INPUT]: 依赖调用方按需加载的全局 APlayer + MetingJS 脚本；接收 enabled（脚本就绪且需要出声）、sourceKey（当前音源的标识）、shouldAutoplay
 * [OUTPUT]: 对外提供 useMeting hook（播放控制和状态）、PLAYLIST_ID（默认歌单）
 * [POS]: vinyl-player 的音频数据层，桥接 MetingJS Web Component 与 React 状态。
 *        调用方换音源时用 sourceKey 重建 <meting-js>，本 hook 随之重新接管新的 APlayer 实例。
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

export function useMeting(enabled, sourceKey, shouldAutoplay) {
  const containerRef = useRef(null)
  const aplayerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)

  useEffect(() => {
    // 换音源或停用时，旧实例的状态全部作废
    aplayerRef.current = null
    setIsReady(false)
    setIsPlaying(false)
    setCurrentTrack(null)

    if (!enabled || !containerRef.current) return

    const metingEl = containerRef.current.querySelector('meting-js')

    if (!metingEl) return

    let attempts = 0
    // APlayer 只有 on 没有 off。换音源后旧实例随 <meting-js> 一起销毁，这里用标记让它迟到的事件不再改状态
    let isDisposed = false
    const onPlay = () => !isDisposed && setIsPlaying(true)
    const onPause = () => !isDisposed && setIsPlaying(false)

    const onSwitch = (event) => {
      const ap = aplayerRef.current

      if (ap && !isDisposed) setCurrentTrack(extractTrack(ap.list.audios, event.index))
    }

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

      ap.on('play', onPlay)
      ap.on('pause', onPause)
      ap.on('listswitch', onSwitch)

      setIsReady(true)

      // 浏览器拒绝自动播放时 APlayer 自己会回到暂停状态，用户再点一次播放即可
      if (shouldAutoplay) ap.play()
    }, 300)

    return () => {
      isDisposed = true
      clearInterval(poll)
    }
    // shouldAutoplay 只在接管新实例的那一刻读取，它变化时不需要重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sourceKey])

  const toggle = useCallback(() => aplayerRef.current?.toggle(), [])
  const next = useCallback(() => aplayerRef.current?.skipForward(), [])
  const prev = useCallback(() => aplayerRef.current?.skipBack(), [])

  return { containerRef, isReady, isPlaying, currentTrack, toggle, next, prev }
}
