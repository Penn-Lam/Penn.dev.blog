/**
 * [INPUT]: 依赖调用方按需加载的全局 APlayer + MetingJS 脚本；接收 enabled（脚本就绪且需要出声）、sourceKey（当前音源的标识）、shouldAutoplay、startIndex（接管时先跳到歌单的第几首，可为 null）、onTrackError（某一首取不到音频时调用，参数是它在歌单里的位置）
 * [OUTPUT]: 对外提供 useMeting hook：播放控制、当前曲目及其在歌单里的位置 currentIndex、switchTo（跳到歌单的第几首并播放）、isSkipping（当前这首取不到音频，正等着跳下一首）
 * [POS]: vinyl-player 的音频数据层，桥接 MetingJS Web Component 与 React 状态。
 *        调用方换音源时用 sourceKey 重建 <meting-js>，本 hook 随之重新接管新的 APlayer 实例。
 *        取不到音频时不在这里跳歌：APlayer 自己会在 2 秒后跳到下一首并继续播。这里只把失败报给调用方，再跳一次会连跳两首。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_POLL_ATTEMPTS = 50 // 15s 超时（50 × 300ms）

/** 从 APlayer audios 数组提取 track 信息 */
const extractTrack = (audios, index) => {
  const t = audios?.[index]

  return t ? { name: t.name, artist: t.artist, cover: t.cover } : null
}

export function useMeting(enabled, sourceKey, shouldAutoplay, startIndex, onTrackError) {
  const containerRef = useRef(null)
  const aplayerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(null)
  const [isSkipping, setIsSkipping] = useState(false)
  const startIndexRef = useRef(startIndex)
  const onTrackErrorRef = useRef(onTrackError)

  // 接管新实例的那一刻要读到最新的起始位置；这个 effect 排在接管之前，先执行
  useEffect(() => {
    startIndexRef.current = startIndex
    onTrackErrorRef.current = onTrackError
  }, [startIndex, onTrackError])

  useEffect(() => {
    // 换音源或停用时，旧实例的状态全部作废
    aplayerRef.current = null
    setIsReady(false)
    setIsPlaying(false)
    setCurrentTrack(null)
    setCurrentIndex(null)
    setIsSkipping(false)

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

      if (!ap || isDisposed) return

      setCurrentTrack(extractTrack(ap.list.audios, event.index))
      setCurrentIndex(event.index)
      setIsSkipping(false)
    }

    // <audio> 报错：地址取不到，或取回来的不是音频（网易云对不可播的歌返回一张网页）
    const onError = () => {
      const ap = aplayerRef.current

      if (!ap || isDisposed || !ap.audio.error) return

      // 歌单只有一首时 APlayer 不会跳，也就没有“正在跳过”这个状态
      setIsSkipping(ap.list.audios.length > 1)
      onTrackErrorRef.current?.(ap.list.index)
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

      // 调用方要求从歌单的某一首开始：先跳过去，再读当前曲目
      const firstIndex = startIndexRef.current

      if (firstIndex != null && firstIndex < (ap.list?.audios?.length ?? 0)) ap.list.switch(firstIndex)

      if (ap.list?.audios?.length > 0) {
        setCurrentTrack(extractTrack(ap.list.audios, ap.list.index))
        setCurrentIndex(ap.list.index)
      }

      ap.on('play', onPlay)
      ap.on('pause', onPause)
      ap.on('listswitch', onSwitch)
      ap.on('error', onError)

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

  const switchTo = useCallback((index) => {
    const ap = aplayerRef.current

    if (!ap || index >= ap.list.audios.length) return

    ap.list.switch(index)
    ap.play()
  }, [])

  // 第二个参数让 APlayer 不把音量写进 localStorage，音量只由唱机上的旋钮决定
  const setVolume = useCallback((volume) => aplayerRef.current?.volume(volume, true), [])

  return {
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
  }
}
