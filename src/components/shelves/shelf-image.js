'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * [INPUT]: 依赖 react 的 useState、useRef、useEffect
 * [OUTPUT]: 对外提供 ShelfImage 组件
 * [POS]: components/shelves 唯一的客户端组件。三种陈列的封面都经过它。
 *        封面来自别人的站点，随时可能失效：先试 src，失败后试 fallbackSrc，都失败就渲染调用方给的 fallback 节点（一块没有图的画布、布面封皮或白唱片套）。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function ShelfImage({ src, fallbackSrc, fallback, className, width, height }) {
  const sources = [src, fallbackSrc].filter(Boolean)
  const [failedCount, setFailedCount] = useState(0)
  const imageRef = useRef(null)
  const currentSrc = sources[failedCount]

  // 图片可能在 hydration 之前就加载失败，那时 onError 已经错过，这里补查一次
  useEffect(() => {
    const image = imageRef.current

    if (image?.complete && image.naturalWidth === 0) setFailedCount((count) => count + 1)
  }, [currentSrc])

  if (!currentSrc) return fallback

  return (
    <img
      ref={imageRef}
      src={currentSrc}
      alt=""
      className={className}
      // 已知尺寸时写上，图片加载前就占好位置，墙面不跳动
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      // 微信读书等图床按来源限制外链，不发 Referer 才能取到图
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFailedCount((count) => count + 1)}
    />
  )
}
