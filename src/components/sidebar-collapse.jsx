'use client'

import { createContext, useContext, useState } from 'react'

/**
 * [INPUT]: 无
 * [OUTPUT]: SidebarCollapseProvider + useSidebarCollapse
 * [POS]: app/layout.js 包裹 SiteSidebar 与页面内容，共享主侧栏收起状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const SidebarCollapseContext = createContext({ collapsed: false, setCollapsed: () => {} })

export const SidebarCollapseProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarCollapseContext.Provider value={{ collapsed, setCollapsed }}>{children}</SidebarCollapseContext.Provider>
  )
}

export const useSidebarCollapse = () => useContext(SidebarCollapseContext)
