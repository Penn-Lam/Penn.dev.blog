import { expect, test } from 'bun:test'

import { dismissNotification, getNotifications, notify, subscribeToNotifications } from './notifications'

test('publishes and dismisses notifications', () => {
  let updates = 0

  const unsubscribe = subscribeToNotifications(() => {
    updates += 1
  })

  const id = notify({ title: 'Saved', duration: 0 })

  expect(getNotifications()).toContainEqual(expect.objectContaining({ id, title: 'Saved' }))

  dismissNotification(id)
  unsubscribe()

  expect(getNotifications()).toEqual([])
  expect(updates).toBe(2)
})
