'use client'

/**
 * [INPUT]: 依赖 useMeting hook（音频控制）、VinylRecord（视觉层）
 * [OUTPUT]: 对外提供 VinylPlayer 组件
 * [POS]: vinyl-player 的主组件，组合音频控制与唱片 UI，自带展开/收起状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { DiscIcon, SkipBack, SkipForward } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { useKeyPress } from '@/hooks/useKeyPress'
import { cn } from '@/lib/utils'

import { PLAYLIST_ID, useMeting } from './use-meting'
import { VinylRecord } from './vinyl-record'

export const VinylPlayer = memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = useCallback(() => setIsOpen((v) => !v), [])
  useKeyPress(toggleOpen, ['Digit0'])
  const { containerRef, isReady, isPlaying, currentTrack, toggle, next, prev } = useMeting()

  return (
    <div className="hidden lg:block">
      <div ref={containerRef} className="pointer-events-none fixed -left-[9999px] opacity-0">
        <meting-js server="netease" type="playlist" id={PLAYLIST_ID} preload="auto" />
      </div>
      <button
        onClick={toggleOpen}
        className={cn(
          'flex w-full items-center justify-between rounded-lg p-2 font-medium',
          isOpen ? 'bg-black text-white' : 'hover:bg-gray-200'
        )}
      >
        <span className="flex items-center gap-2">
          <DiscIcon size={16} />
          Music
        </span>
        <span
          className={cn(
            'hidden size-5 place-content-center rounded-sm border border-gray-200 bg-gray-100 text-xs font-medium text-gray-500 lg:grid',
            isOpen && 'border-gray-600 bg-gray-700 text-gray-200'
          )}
          title="Shortcut key: 0"
        >
          0
        </span>
      </button>
      {isOpen && isReady && (
        <div className="flex items-center justify-center gap-2 pt-3">
          <button onClick={prev} className="text-gray-400 transition-colors hover:text-gray-600" aria-label="上一首">
            <SkipBack size={12} />
          </button>
          <span className="group/name relative w-24 overflow-visible text-center text-[10px] text-gray-500">
            <span className="block truncate">{currentTrack?.name || '...'}</span>
            {currentTrack?.name && (
              <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] whitespace-nowrap text-white shadow-md group-hover/name:block">
                {currentTrack.name}
              </span>
            )}
          </span>
          <button onClick={next} className="text-gray-400 transition-colors hover:text-gray-600" aria-label="下一首">
            <SkipForward size={12} />
          </button>
        </div>
      )}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="flex justify-center pt-2 pb-2">
            <VinylRecord
              isPlaying={isPlaying}
              coverUrl={currentTrack?.cover}
              onClick={isReady ? toggle : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
})
VinylPlayer.displayName = 'VinylPlayer'
