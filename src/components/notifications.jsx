'use client'

import { useSyncExternalStore } from 'react'

import { Notification, NotificationViewport } from '@/components/base/notification/notification'
import { dismissNotification, getNotifications, subscribeToNotifications } from '@/lib/notifications'

/**
 * [INPUT]: 依赖 BoardUI 的 Notification / NotificationViewport
 * [OUTPUT]: 对外提供 <SiteNotifications /> 视口
 * [POS]: 全站 toast/通知的统一出口，替代 sonner
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 *
 * 用法：
 *   import { notify } from '@/lib/notifications'
 *   notify.error('Error loading view counts', error)
 *   notify.success('Bookmark submitted')            // 带 Penn Lam 头像
 *   <SiteNotifications />                           // 挂一次（root layout）
 */

export function SiteNotifications({ position = 'bottom-right' }) {
  const snapshot = useSyncExternalStore(subscribeToNotifications, getNotifications, getNotifications)

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
          onDismiss={() => dismissNotification(item.id)}
          // 站点全局 base 层给裸 <p> 加了 mb-6（文章排版遗留），
          // 卡片内全部 <p>（标题/描述/多段消息）在这里复位
          className="[&_p]:mb-0"
        />
      ))}
    </NotificationViewport>
  )
}
