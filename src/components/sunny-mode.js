'use client'

/**
 * [INPUT]: 无外部依赖，使用 public/assets/leaves.png 素材
 * [OUTPUT]: 对外提供 SunnyToggle（iOS 风格开关 + 提示语）和 SunnyOverlay（光影覆盖层）
 * [POS]: components/ 的阳光模式组件，被 app/page.js 使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sunny-mode'
const SHUTTER_COUNT = 23
const EVENT_NAME = 'sunny-mode-change'

/* ========================================================================
   共享状态 — useSyncExternalStore + CustomEvent 广播
   ======================================================================== */
let listeners = new Set()

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

function getServerSnapshot() {
  return false
}

function useSunnyMode() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    const handler = () => listeners.forEach((cb) => cb())
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  const toggle = useCallback(() => {
    const next = !getSnapshot()
    localStorage.setItem(STORAGE_KEY, String(next))
    window.dispatchEvent(new Event(EVENT_NAME))
  }, [])

  return { active, toggle }
}

/* ========================================================================
   iOS 风格 toggle 开关 + 调皮提示语
   ======================================================================== */
export function SunnyToggle() {
  const { active, toggle } = useSunnyMode()

  return (
    <div className="flex items-center gap-3">
      <button
        role="switch"
        aria-checked={active}
        aria-label={active ? '关闭阳光模式' : '开启阳光模式'}
        onClick={toggle}
        className="relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full transition-colors duration-300"
        style={{ backgroundColor: active ? '#f59e0b' : '#e5e7eb' }}
      >
        <span
          className="absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300"
          style={{ transform: active ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
      <span className="text-[13px] text-gray-400 italic">
        {active ? 'the sun is peeking through ☀' : '← psst… try flipping this'}
      </span>
    </div>
  )
}

/* ========================================================================
   阳光光影覆盖层 — fixed 定位，不阻挡交互
   ======================================================================== */
export function SunnyOverlay() {
  const { active } = useSunnyMode()

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      {/* 百叶窗 + 树叶 — blur(3px) 柔化阴影边缘 */}
      <div
        className="absolute transition-opacity duration-800"
        style={{
          opacity: active ? 0.07 : 0,
          top: '-30vh',
          right: 0,
          width: '80vw',
          height: '130vh',
          filter: 'blur(3px)',
          backgroundBlendMode: 'darken',
          transformOrigin: 'top right',
          transformStyle: 'preserve-3d',
          transform: `matrix3d(
            0.75, -0.0625, 0, 0.0008,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
          )`
        }}
      >
        <div
          className="sunny-leaves absolute"
          style={{
            bottom: -20,
            right: -700,
            width: 1600,
            height: 1400,
            backgroundImage: 'url(/assets/leaves.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            filter: 'url(#sunny-wind)'
          }}
        />
        <div className="relative w-full">
          <div className="flex flex-col items-end" style={{ gap: 60 }}>
            {Array.from({ length: SHUTTER_COUNT }, (_, i) => (
              <div key={i} className="w-full" style={{ height: 40, backgroundColor: '#1a1917' }} />
            ))}
          </div>
          <div className="absolute inset-0 flex justify-around">
            <div style={{ width: 5, height: '100%', backgroundColor: '#1a1917' }} />
            <div style={{ width: 5, height: '100%', backgroundColor: '#1a1917' }} />
          </div>
        </div>
      </div>

      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="sunny-wind" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" numOctaves="2" seed="1">
              <animate
                attributeName="baseFrequency"
                dur="16s"
                keyTimes="0;0.33;0.66;1"
                values="0.005 0.003;0.01 0.009;0.008 0.004;0.005 0.003"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic">
              <animate
                attributeName="scale"
                dur="20s"
                keyTimes="0;0.25;0.5;0.75;1"
                values="45;55;75;55;45"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>
    </div>
  )
}
