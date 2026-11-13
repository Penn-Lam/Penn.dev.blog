'use client'

import { createContext, useContext, useMemo, useRef, useState } from 'react'

/**
 * [INPUT]: 依赖 react 的 createContext、useContext、useMemo、useRef、useState
 * [OUTPUT]: 对外提供 TurntableProvider 组件、useTurntable hook
 * [POS]: vinyl-player 的共享状态。唱机（Turntable）和唱片架上的唱片（shelves/record-disc.js）隔着服务端渲染的列表，靠它对话：
 *        record 是转盘上那张唱片（null 表示放着默认歌单），platterRef 是转盘的位置（唱片飞过去时要量），isRecordHeld 表示有唱片正被拿在手里。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const TurntableContext = createContext(null)

export function TurntableProvider({ children }) {
  const platterRef = useRef(null)
  const [record, setRecord] = useState(null)
  const [isRecordHeld, setIsRecordHeld] = useState(false)

  const value = useMemo(
    () => ({ platterRef, record, placeRecord: setRecord, isRecordHeld, setIsRecordHeld }),
    [record, isRecordHeld]
  )

  return <TurntableContext.Provider value={value}>{children}</TurntableContext.Provider>
}

export const useTurntable = () => useContext(TurntableContext)
