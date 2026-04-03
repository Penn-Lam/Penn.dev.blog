'use client'

/**
 * [INPUT]: 依赖 friends.json 的友链数据，GitHub Contributions API
 * [OUTPUT]: 对外提供 FriendCard 组件，工牌风格友链卡片
 * [POS]: components/ 的友链展示组件，被 friends/page.js 使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from 'react'

const LEVEL_COLORS = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function GithubHeatmap({ github }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!github) return
    fetch(`https://github-contributions-api.jogruber.de/v4/${github}?y=last`)
      .then((res) => res.json())
      .then((raw) => {
        const contributions = raw.contributions || []
        if (!contributions.length) return

        // 按日期升序分组为周
        const ascending = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date))
        const weeks = []
        let week = []
        ascending.forEach((day, i) => {
          const dow = new Date(day.date).getDay()
          if (dow === 0 && week.length > 0) {
            weeks.push(week)
            week = []
          }
          week.push(day)
          if (i === ascending.length - 1) weeks.push(week)
        })

        // 倒序：最新月份在上
        weeks.reverse()

        // 计算每周对应的月份标签
        let currentMonth = -1
        const monthMarks = []
        weeks.forEach((w, wi) => {
          const month = new Date(w[0].date).getMonth()
          if (month !== currentMonth) {
            monthMarks.push({ month, weekIndex: wi })
            currentMonth = month
          }
        })

        setData({ weeks, monthMarks })
      })
      .catch(() => {})
  }, [github])

  if (!data) return null

  const numWeeks = data.weeks.length

  return (
    <div className="flex h-full gap-[3px]">
      {/* 月份标签列 */}
      <div className="relative h-full shrink-0" style={{ width: 18 }}>
        {data.monthMarks.map(({ month, weekIndex }) => (
          <div
            key={`${month}-${weekIndex}`}
            className="absolute right-0 font-mono text-[6px] leading-none text-gray-400"
            style={{ top: `${(weekIndex / numWeeks) * 100}%` }}
          >
            {MONTHS[month]}
          </div>
        ))}
      </div>
      {/* 热力图网格 — 高度填满容器，列宽由行高+aspect-ratio决定 */}
      <div
        className="grid h-full gap-[1px]"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(${numWeeks}, 1fr)`
        }}
      >
        {data.weeks.flatMap((week, wi) => {
          const cells = week.map((day, di) => (
            <div
              key={`${wi}-${di}`}
              className="aspect-square min-h-0 min-w-0 rounded-[1px]"
              style={{ backgroundColor: LEVEL_COLORS[day.level] || LEVEL_COLORS[0] }}
            />
          ))
          const lastDow = new Date(week[week.length - 1].date).getDay()
          for (let i = lastDow + 1; i < 7; i++) {
            cells.push(
              <div key={`${wi}-pad-${i}`} className="aspect-square min-h-0 min-w-0" style={{ visibility: 'hidden' }} />
            )
          }
          return cells
        })}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <div
      className="text-[9px] font-bold tracking-widest text-[#9cab8c] sm:text-[11px]"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {children}
    </div>
  )
}

export function FriendCard({ friend }) {
  const { name, url, avatar, signature, github } = friend

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      <img
        src="/assets/friends-card.png"
        alt=""
        className="pointer-events-none block w-full !rounded-none !border-0 select-none"
        draggable={false}
      />

      {/* 内容覆盖层 — 对齐卡片体白色区域内部 */}
      <div className="absolute overflow-hidden" style={{ top: '44%', bottom: '9%', left: '23%', right: '22%' }}>
        <div className="flex h-full gap-2">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="mb-4">
              <Label>hello, my name is</Label>
              <div className="truncate text-lg leading-tight font-extrabold tracking-tight text-gray-900 uppercase sm:text-2xl">
                {name}
              </div>
            </div>

            <div className="mb-3">
              <Label>signature</Label>
              <div
                className="mt-4 -rotate-3 text-xl text-gray-800 sm:text-2xl"
                style={{ fontFamily: "'Brittany Signature', cursive" }}
              >
                {signature || name}
              </div>
            </div>

            <div
              className="mt-auto aspect-square w-14 overflow-hidden rounded-sm sm:w-20"
              style={{ mixBlendMode: 'multiply' }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-full w-full !rounded-none !border-0 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg font-bold text-gray-400">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="h-full shrink-0 overflow-hidden">
            <GithubHeatmap github={github} />
          </div>
        </div>
      </div>
    </a>
  )
}
