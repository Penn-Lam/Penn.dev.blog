'use client'

import { useEffect, useRef } from 'react'

/**
 * [INPUT]: 依赖 react 的 useRef、useEffect；依赖浏览器的 pointer 事件与 requestAnimationFrame
 * [OUTPUT]: 对外提供 PointerTilt 组件
 * [POS]: components/ 的指针跟随底座，拟物件共用：Stack 的卡带、画廊墙的画框、唱片架的封套。
 *        它只做一件事：把指针在自身范围内的位置写成两个 CSS 变量 --px、--py（范围 -1 到 1，中心为 0），并用逐帧插值让数值平滑变化。
 *        倾斜多少度、高光怎么动，由各自的样式表用这两个变量决定。变量写在外层元素上，倾斜做在内层元素上，外层的边界不随倾斜变化，不会抖。
 *        触屏设备和开启“减少动态效果”的用户不启用。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 每帧向目标靠近的比例，越小越“黏”
const FOLLOW_RATE = 0.14

const REST_THRESHOLD = 0.002

export function PointerTilt({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const step = () => {
      currentX += (targetX - currentX) * FOLLOW_RATE
      currentY += (targetY - currentY) * FOLLOW_RATE
      element.style.setProperty('--px', currentX.toFixed(3))
      element.style.setProperty('--py', currentY.toFixed(3))

      const isMoving = Math.abs(targetX - currentX) > REST_THRESHOLD || Math.abs(targetY - currentY) > REST_THRESHOLD

      frame = isMoving ? requestAnimationFrame(step) : 0
    }

    const follow = (x, y) => {
      targetX = x
      targetY = y

      if (!frame) frame = requestAnimationFrame(step)
    }

    const handleMove = (event) => {
      const bounds = element.getBoundingClientRect()

      follow(
        Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1)),
        Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1))
      )
    }

    const handleLeave = () => follow(0, 0)

    element.addEventListener('pointermove', handleMove)
    element.addEventListener('pointerleave', handleLeave)

    return () => {
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerleave', handleLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  )
}
