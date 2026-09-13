'use client'

import { useSyncExternalStore } from 'react'

import { Notification, NotificationViewport } from '@/components/base/notification/notification'

/**
 * [INPUT]: 依赖 BoardUI 的 Notification / NotificationViewport
 * [OUTPUT]: 对外提供 notify() 命令式 API 与 <SiteNotifications /> 视口
 * [POS]: 全站 toast/通知的统一出口，替代 sonner
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 *
 * 用法：
 *   import { notify } from '@/components/notifications'
 *   notify.error('Error loading view counts', error)
 *   notify.success('Bookmark submitted')            // 带 Penn Lam 头像
 *   <SiteNotifications />                           // 挂一次（root layout）
 */

const SUCCESS_AVATAR = {
  src: '/assets/logo.webp',
  alt: 'Penn Lam',
  presence: 'online'
}

let nextId = 0
let items = []
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

function push(item) {
  nextId += 1
  items = [...items, { id: nextId, ...item }]
  emit()
  return nextId
}

function dismiss(id) {
  items = items.filter((item) => item.id !== id)
  emit()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notify({ title, description, status = 'neutral', avatar, timestamp, duration = 5000 }) {
  const id = push({ title, description, status, avatar, timestamp, duration })
  // autoDismissDuration 走组件内倒计时条；到期后这里真正移除
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration + 300)
  }
  return id
}

notify.success = (title, description, options = {}) =>
  notify({
    title: 'Penn Lam',
    description: title,
    timestamp: 'now',
    status: 'success',
    avatar: SUCCESS_AVATAR,
    ...options
  })

notify.error = (title, description, options = {}) => notify({ title, description, status: 'error', ...options })

notify.info = (title, description, options = {}) => notify({ title, description, status: 'information', ...options })

export function SiteNotifications({ position = 'bottom-right' }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => items,
    () => items
  )

  return (
    <NotificationViewport position={position}>
      {snapshot.map((item, index) => (
        <Notification
          key={item.id}
          title={item.title}
          description={item.description}
          status={item.status}
          avatar={item.avatar}
          timestamp={item.timestamp}
          introDelay={index * 0.06}
          autoDismissDuration={item.duration}
          onDismiss={() => dismiss(item.id)}
        />
      ))}
    </NotificationViewport>
  )
}
