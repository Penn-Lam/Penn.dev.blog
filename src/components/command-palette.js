'use client'

import { Search, Sparkles, ArrowRight, Keyboard } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

import { LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/constants 的导航链接
 * [OUTPUT]: 对外提供 CommandPalette 组件，Ctrl+K 快捷键面板
 * [POS]: components/ 全局命令面板
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// Ctrl+K 面板策略:
// 类似于 macOS 的 Spotlight 搜索，提供快速导航
// 支持搜索页面、执行命令
// ==========================================================================

// 预设命令
const COMMANDS = [
  {
    id: 'theme-toggle',
    label: 'Toggle theme',
    description: 'Switch between light and dark mode',
    icon: '🎨',
    action: () => {
      document.documentElement.classList.toggle('dark')
      const isDark = document.documentElement.classList.contains('dark')
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  },
  {
    id: 'scroll-top',
    label: 'Scroll to top',
    description: 'Jump to the beginning of the page',
    icon: '⬆️',
    action: () => window.scrollTo({ top: 0, behavior: 'smooth' })
  },
  {
    id: 'scroll-bottom',
    label: 'Scroll to bottom',
    description: 'Jump to the end of the page',
    icon: '⬇️',
    action: () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  },
  {
    id: 'random-post',
    label: 'Random article',
    description: 'Discover a random writing',
    icon: '🎲',
    action: () => {
      // 随机跳转到一篇文章
      const posts = ['/writing/react-hooks', '/writing/nextjs-tutorial', '/writing/ai-agents']
      const random = posts[Math.floor(Math.random() * posts.length)]
      window.location.href = random
    }
  },
  {
    id: 'toggle-shortcuts',
    label: 'Show keyboard shortcuts',
    description: 'Display all available keyboard shortcuts',
    icon: '⌨️',
    action: () => {
      // 触发快捷键提示显示
      const event = new CustomEvent('show-shortcuts')
      window.dispatchEvent(event)
    }
  },
  {
    id: 'easter-egg',
    label: '???: Konami Code',
    description: 'Enter the legendary Konami Code',
    icon: '👀',
    action: () => {
      const event = new CustomEvent('trigger-easter-egg')
      window.dispatchEvent(event)
    }
  }
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  // 所有可搜索项
  const allItems = [
    // 导航链接
    ...LINKS.map(link => ({
      type: 'navigation',
      id: link.href,
      label: link.label,
      description: link.href,
      icon: link.icon,
      action: () => window.location.href = link.href
    })),
    // 命令
    ...COMMANDS.map(cmd => ({
      type: 'command',
      id: cmd.id,
      label: cmd.label,
      description: cmd.description,
      icon: cmd.icon,
      action: cmd.action
    }))
  ]

  // 过滤搜索结果
  const filteredItems = allItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  )

  // 打开/关闭
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 键盘导航
  const handleKeyNavigation = useCallback((e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action()
          setIsOpen(false)
          setQuery('')
        }
        break
    }
  }, [isOpen, filteredItems, selectedIndex])

  useEffect(() => {
    handleKeyNavigation
  }, [handleKeyNavigation])

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // 监听其他事件触发
  useEffect(() => {
    const handleEasterEgg = () => setIsOpen(true)
    window.addEventListener('trigger-easter-egg', handleEasterEgg)
    return () => window.removeEventListener('trigger-easter-egg', handleEasterEgg)
  }, [])

  // SSR 安全
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      {isOpen && (
        <>
          {/* 背板 */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          {/* 面板 */}
          <div className="fixed left-1/2 top-1/4 z-50 w-full max-w-xl -translate-x-1/2">
            <div className="mx-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
              {/* 搜索框 */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages or run commands..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  autoFocus
                />
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* 结果列表 */}
              <div className="max-h-80 overflow-y-auto py-2">
                {query === '' && (
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-500">Suggested</p>
                  </div>
                )}

                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    <Sparkles size={24} className="mx-auto mb-2 text-gray-300" />
                    <p>No results found</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Try a different search term or press ESC to close
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action()
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                      {index === selectedIndex && (
                        <ArrowRight size={16} className="text-gray-400" />
                      )}
                      {item.type === 'command' && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                          Command
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* 底部提示 */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Keyboard size={12} />
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowRight size={12} />
                    Select
                  </span>
                </div>
                <span>Press ⌘K to open anytime</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  )
}

/**
 * 在页面底部显示的 Ctrl+K 提示
 */
export function CommandPaletteHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // 只在主页显示，且只显示一次
    if (window.location.pathname === '/') {
      const timer = setTimeout(() => setShow(true), 3000)
      const handleKeyDown = () => {
        setShow(false)
        clearTimeout(timer)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
      onClick={() => {
        setShow(false)
        const event = new CustomEvent('open-command-palette')
        window.dispatchEvent(event)
      }}
    >
      <span className="flex items-center gap-2">
        <kbd className="rounded bg-gray-700 px-2 py-0.5 text-xs font-mono">⌘ K</kbd>
        <span>to search</span>
      </span>
    </div>
  )
}
