'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'

import { pileHeight } from './cartridge-pose'

/**
 * [INPUT]: 依赖 react 的 useEffect、useEffectEvent、useRef、useState；依赖 ./cartridge-pose 的 pileHeight；按需加载 ./cartridge-scene 的 createCartridgeScene
 * [OUTPUT]: 对外提供 CartridgePile 组件
 * [POS]: components/stack 的画布容器，React 与三维场景之间唯一的接缝。
 *        它在页面上占一摞卡带的位置，放一块比自己大一圈的画布（卡带立起来、投下阴影时不被裁掉）和一层接指针的命中区。
 *        选中项和悬停项由 CartridgeRack 持有，从属性传进来；场景里的点击和悬停通过 onSelect、onPeek 交回去。
 *        three 和场景代码用动态 import 加载，不进其他页面的包。浏览器不支持 WebGL 时不渲染画布，清单照常可用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function CartridgePile({ tools, selectedSlug, peekSlug, onPeek, onSelect }) {
  const canvasRef = useRef(null)
  const hitAreaRef = useRef(null)
  const sceneRef = useRef(null)
  const [isUnsupported, setIsUnsupported] = useState(false)

  const handlePeek = useEffectEvent(onPeek)
  const handleSelect = useEffectEvent(onSelect)
  const syncState = useEffectEvent(() => sceneRef.current?.setState({ selectedSlug, peekSlug }))

  useEffect(() => {
    let isCancelled = false

    import('./cartridge-scene').then(({ createCartridgeScene }) => {
      if (isCancelled) return

      try {
        sceneRef.current = createCartridgeScene({
          canvas: canvasRef.current,
          hitArea: hitAreaRef.current,
          tools,
          fontFamily: getComputedStyle(hitAreaRef.current).fontFamily,
          isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          canHover: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
          onPeek: (slug) => handlePeek(slug),
          onSelect: (slug) => handleSelect(slug)
        })
        syncState()
      } catch (error) {
        console.error('Cartridge scene failed to start', error)
        setIsUnsupported(true)
      }
    })

    return () => {
      isCancelled = true
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [tools])

  useEffect(() => {
    syncState()
  }, [selectedSlug, peekSlug])

  if (isUnsupported) return null

  return (
    <div className="relative mx-auto w-full max-w-64 font-mono" style={{ height: pileHeight(tools.length) }}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute -top-14 -left-12 h-[calc(100%+7rem)] w-[calc(100%+6rem)]"
      />
      <div ref={hitAreaRef} className="absolute -inset-x-5 inset-y-0 touch-pan-y" />
    </div>
  )
}
