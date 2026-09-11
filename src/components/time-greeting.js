'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 window 和 React hooks
 * [OUTPUT]: 对外提供 TimeGreeting 组件，显示个性化问候
 * [POS]: components/header 的问候组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 时间问候策略:
// 根据时间段显示不同的问候语，配合技术创始人的专业风格
// ==========================================================================

const timeBasedGreetings = {
  dawn: {
    icon: '🌅',
    greeting: 'Good morning, early bird',
    tagline: 'The best code is written before sunrise'
  },
  morning: {
    icon: '☕',
    greeting: 'Good morning',
    tagline: 'Ready to build something amazing?'
  },
  noon: {
    icon: '🌤️',
    greeting: 'Good afternoon',
    tagline: 'Time for a coffee break?'
  },
  afternoon: {
    icon: '📈',
    greeting: 'Good afternoon',
    tagline: 'Keep the momentum going'
  },
  evening: {
    icon: '🌙',
    greeting: 'Good evening',
    tagline: 'Winding down or powering through?'
  },
  night: {
    icon: '🌃',
    greeting: 'Good evening, night owl',
    tagline: 'The best bugs are found after midnight'
  },
  deepnight: {
    icon: '✨',
    greeting: 'Working late?',
    tagline: "The code isn't going to write itself"
  }
}

function getTimePeriod() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 21) return 'evening'
  if (hour >= 21 && hour < 24) return 'night'
  return 'deepnight'
}

// 随机技术格言
const techQuotes = [
  'First, solve the problem. Then, write the code.',
  "Programming is not about typing, it's about thinking.",
  "The best code is code you don't have to write.",
  'Simplicity is the ultimate sophistication.',
  'Debugging is like being a detective in a crime movie.',
  'Every great developer you know got there by solving problems.',
  'First, make it work. Then, make it fast.',
  'The code is poetry, the comments are the explanation.'
]

function getRandomQuote() {
  return techQuotes[Math.floor(Math.random() * techQuotes.length)]
}

export function TimeGreeting({ className }) {
  const [period, setPeriod] = useState('morning')
  const [quote, setQuote] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPeriod(getTimePeriod())
    setQuote(getRandomQuote())
    setMounted(true)
  }, [])

  const timeData = timeBasedGreetings[period]

  if (!mounted) {
    return <div className={cn('h-12', className)} />
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{timeData.icon}</span>
        <span className="text-body-medium text-text-secondary">{timeData.greeting}</span>
      </div>
      <p className="text-caption-1-regular text-text-tertiary italic">"{quote}"</p>
    </div>
  )
}
