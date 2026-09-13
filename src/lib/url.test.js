import { expect, test } from 'bun:test'

import { addDefaultProtocol, getFaviconUrl, getUrlHostname, isValidWebsiteUrl } from '@/lib/url'

test('normalizes web URLs and builds favicon URLs', () => {
  expect(addDefaultProtocol('pennlam.com')).toBe('https://pennlam.com')
  expect(getFaviconUrl('https://pennlam.com/friends')).toBe(
    'https://www.google.com/s2/favicons?domain=pennlam.com&sz=32'
  )
  expect(getUrlHostname('https://www.pennlam.com/friends')).toBe('pennlam.com')
  expect(isValidWebsiteUrl('pennlam.com')).toBe(true)
  expect(isValidWebsiteUrl('http://127.0.0.1')).toBe(false)
  expect(getFaviconUrl('')).toBeNull()
})
