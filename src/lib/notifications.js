'use client'

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

export function dismissNotification(id) {
  items = items.filter((item) => item.id !== id)
  emit()
}

export function subscribeToNotifications(listener) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export function getNotifications() {
  return items
}

export function notify({ title, description, status = 'neutral', avatar, timestamp, duration = 5000 }) {
  const id = push({ title, description, status, avatar, timestamp, duration })

  if (duration > 0) {
    setTimeout(() => dismissNotification(id), duration + 300)
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
