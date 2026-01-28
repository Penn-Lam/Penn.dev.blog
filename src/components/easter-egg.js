'use client'

import { useCallback, useEffect, useState } from 'react'

import { KonamiListener } from '@/lib/konami'

/**
 * [INPUT]: 依赖 @/lib/konami 的 KonamiListener
 * [OUTPUT]: 对外提供 EasterEgg 组件，终端风格的彩蛋动画
 * [POS]: components/ 的彩蛋组件，监听 Konami 代码触发
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const Line = ({ line }) => {
  const types = {
    empty: () => <div className="h-4" />,
    prompt: () => (
      <div className="mb-2 flex items-center gap-2">
        <span className="text-green-400">➜</span>
        <span className="text-cyan-400">~/stack</span>
        <span className="text-gray-400">$</span>
        <span className="text-white">{line.text}</span>
      </div>
    ),
    header: () => <div className="text-gray-500">{line.text}</div>,
    tool: () => (
      <div className="flex items-baseline gap-4 py-0.5">
        <span className="w-28 shrink-0 text-green-400">{line.name}</span>
        <span className="text-gray-500">-</span>
        <span className="text-gray-300">{line.desc}</span>
      </div>
    ),
    success: () => <div className="mt-2 text-yellow-400">{line.text}</div>
  }
  return types[line.type]?.() || <div className="text-gray-300">{line.text}</div>
}

export const EasterEgg = ({ tools = [] }) => {
  const [isActive, setIsActive] = useState(false)
  const [lines, setLines] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  const animateTools = useCallback((allTools) => {
    if (!allTools?.length) {
      setLines((prev) => [...prev, { type: 'output', text: 'No tools found...' }])
      setIsAnimating(false)
      return
    }

    let currentIndex = 0
    const typeNextTool = () => {
      if (currentIndex >= allTools.length) {
        setLines((prev) => [...prev, { type: 'empty' }, { type: 'success', text: 'Done! Press ESC to close...' }])
        setIsAnimating(false)
        return
      }
      const tool = allTools[currentIndex]
      setLines((prev) => [...prev, { type: 'tool', name: tool.name, desc: tool.desc }])
      currentIndex++
      setTimeout(typeNextTool, 60)
    }
    typeNextTool()
  }, [])

  const startTerminal = useCallback(() => {
    setIsActive(true)
    setIsAnimating(true)
    setLines([
      { type: 'prompt', text: 'ls -la' },
      { type: 'empty' },
      { type: 'header', text: 'total 42' },
      { type: 'header', text: 'drwxr-xr-x  7 penn  staff   224B Jan 28 10:00 .' },
      { type: 'header', text: 'drwxr-xr-x  3 penn  staff    96B Jan 28 09:00 ..' }
    ])
    setTimeout(() => animateTools(tools.flatMap((c) => c.tools || [])), 400)
  }, [tools, animateTools])

  useEffect(() => {
    const listener = new KonamiListener(startTerminal)
    listener.start()
    return () => listener.stop()
  }, [startTerminal])

  useEffect(() => {
    if (!isActive) return
    const handleKey = (e) => e.key === 'Escape' && setIsActive(false)
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setIsActive(false)}
    >
      <div
        className="mx-4 w-full max-w-3xl overflow-hidden rounded-xl border border-gray-700/50 bg-[#1e1e1e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-gray-700/50 bg-[#2d2d2d] px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(false)}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f56] transition-transform hover:scale-110"
            />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400">Terminal — stack</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="max-h-[60vh] overflow-y-auto bg-[#1e1e1e] p-4 font-mono text-sm">
          {lines.map((line, i) => (
            <Line key={i} line={line} />
          ))}
          {isAnimating && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-green-400" />}
        </div>
      </div>
    </div>
  )
}
