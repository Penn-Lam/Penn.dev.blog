'use client'

import { createContext, useContext, useMemo, useState } from 'react'

/**
 * [INPUT]: 无
 * [OUTPUT]: SidebarCollapseProvider + useSidebarCollapse
 * [POS]: app/layout.js 包裹 SiteSidebar 与页面内容，共享主侧栏收起状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const SidebarCollapseContext = createContext({ collapsed: false, setCollapsed: () => {} })

export const SidebarCollapseProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const value = useMemo(() => ({ collapsed, setCollapsed }), [collapsed])

  return <SidebarCollapseContext.Provider value={value}>{children}</SidebarCollapseContext.Provider>
}

export const useSidebarCollapse = () => useContext(SidebarCollapseContext)
