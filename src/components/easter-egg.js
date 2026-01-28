'use client'

import { useCallback, useEffect, useState } from 'react'

import { KonamiListener } from '@/lib/konami'

/**
 * [INPUT]: 依赖 @/lib/konami 的 KonamiListener
 * [OUTPUT]: 对外提供 EasterEgg 组件，终端风格的彩蛋动画
 * [POS]: components/ 的彩蛋组件，监听 Konami 代码触发
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const EasterEgg = ({ tools = [] }) => {
  const [isActive, setIsActive] = useState(false)
  const [lines, setLines] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  const animateTools = useCallback((allTools) => {
    if (!allTools || allTools.length === 0) {
      setLines((prev) => [...prev, { type: 'output', text: 'No tools found...' }])
      setIsAnimating(false)
      return
    }

    let currentIndex = 0
    const typeNextTool = () => {
      if (currentIndex >= allTools.length) {
        setLines((prev) => [...prev, { type: 'empty' }, { type: 'success', text: '✓ Done! Press ESC to close...' }])
        setIsAnimating(false)
        return
      }

      const tool = allTools[currentIndex]
      setLines((prev) => [
        ...prev,
        {
          type: 'tool',
          name: tool.name,
          desc: tool.desc
        }
      ])
      currentIndex++

      setTimeout(typeNextTool, 60)
    }

    typeNextTool()
  }, [])

  const startTerminalAnimation = useCallback(() => {
    setIsActive(true)
    setIsAnimating(true)
    setLines([
      { type: 'prompt', text: '~/stack $ ls -la' },
      { type: 'empty' },
      { type: 'header', text: 'total 42' },
      { type: 'header', text: 'drwxr-xr-x  7 penn  staff   224B Jan 28 10:00 .' },
      { type: 'header', text: 'drwxr-xr-x  3 penn  staff    96B Jan 28 09:00 ..' }
    ])

    const allTools = tools.flatMap((category) => category.tools || [])

    setTimeout(() => {
      animateTools(allTools)
    }, 400)
  }, [tools, animateTools])

  useEffect(() => {
    const listener = new KonamiListener(() => {
      startTerminalAnimation()
    })

    listener.start()
    return () => listener.stop()
  }, [startTerminalAnimation])

  const closeEasterEgg = () => {
    setIsActive(false)
    setLines([])
    setIsAnimating(false)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isActive) {
        closeEasterEgg()
      }
    }

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={closeEasterEgg}
    >
      <div
        className="mx-4 w-full max-w-3xl overflow-hidden rounded-xl border border-gray-700/50 bg-[#1e1e1e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-gray-700/50 bg-[#2d2d2d] px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={closeEasterEgg}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f56] transition-transform hover:scale-110"
              title="Close"
            >
              <span className="text-[8px] font-bold text-black/60 opacity-0 hover:opacity-100">×</span>
            </button>
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="h-3 w-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400">Terminal — stack</span>
          </div>
          <div className="w-14"></div>
        </div>

        {/* Terminal Content */}
        <div className="max-h-[60vh] overflow-y-auto bg-[#1e1e1e] p-4 font-mono text-sm">
          {lines.map((line, index) => {
            if (line.type === 'empty') {
              return <div key={index} className="h-4"></div>
            }

            if (line.type === 'prompt') {
              return (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <span className="text-green-400">➜</span>
                  <span className="text-cyan-400">~/stack</span>
                  <span className="text-gray-400">$</span>
                  <span className="text-white">{line.text.replace('~/stack $ ', '')}</span>
                </div>
              )
            }

            if (line.type === 'header') {
              return (
                <div key={index} className="text-gray-500">
                  {line.text}
                </div>
              )
            }

            if (line.type === 'tool') {
              return (
                <div key={index} className="flex items-baseline gap-4 py-0.5">
                  <span className="w-28 shrink-0 text-green-400">{line.name}</span>
                  <span className="text-gray-500">-</span>
                  <span className="text-gray-300">{line.desc}</span>
                </div>
              )
            }

            if (line.type === 'success') {
              return (
                <div key={index} className="mt-2 text-yellow-400">
                  {line.text}
                </div>
              )
            }

            return (
              <div key={index} className="text-gray-300">
                {line.text}
              </div>
            )
          })}

          {/* Cursor */}
          {isAnimating && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-green-400"></span>}
        </div>
      </div>
    </div>
  )
}
