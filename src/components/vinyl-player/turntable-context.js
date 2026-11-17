'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

/**
 * [INPUT]: 依赖 react 的 createContext、useCallback、useContext、useMemo、useRef、useState
 * [OUTPUT]: 对外提供 TurntableProvider 组件、useTurntable hook
 * [POS]: vinyl-player 的共享状态。唱机（Turntable）和唱片架上的唱片（shelves/record-disc.js）隔着服务端渲染的列表，靠它对话：
 *        record 是转盘上那张唱片（null 表示转盘上没有架上的唱片），platterRef 是转盘的位置（唱片飞过去时要量），isRecordHeld 表示有唱片正被拿在手里。
 *        records 是架上全部唱片：歌单自己播到下一首时，唱机靠它找到对应的那张，换到转盘上。
 *        unplayableIds 是这位访客取不到音频的唱片（地区版权、会员专享、已下架）。只有真的播过一次才知道，所以只记在本次访问里，刷新即清空。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const TurntableContext = createContext(null)

export function TurntableProvider({ records, children }) {
  const platterRef = useRef(null)
  const [record, setRecord] = useState(null)
  const [isRecordHeld, setIsRecordHeld] = useState(false)
  const [unplayableIds, setUnplayableIds] = useState(() => new Set())

  const markUnplayable = useCallback((id) => setUnplayableIds((ids) => (ids.has(id) ? ids : new Set(ids).add(id))), [])

  const value = useMemo(
    () => ({
      platterRef,
      records,
      record,
      placeRecord: setRecord,
      isRecordHeld,
      setIsRecordHeld,
      unplayableIds,
      markUnplayable
    }),
    [records, record, isRecordHeld, unplayableIds, markUnplayable]
  )

  return <TurntableContext.Provider value={value}>{children}</TurntableContext.Provider>
}

export const useTurntable = () => useContext(TurntableContext)
