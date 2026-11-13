import { expect, test } from 'bun:test'

import { addDefaultProtocol, getFaviconUrl, getUrlHostname, isValidWebsiteUrl, splitTextByUrls } from '@/lib/url'

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

test('splits bare domains and full URLs out of plain text without eating punctuation', () => {
  const urls = (text) => splitTextByUrls(text).filter((segment) => segment.type === 'url')

  expect(splitTextByUrls('I led the team in designing and developing qiangguoka.com.')).toEqual([
    { type: 'text', value: 'I led the team in designing and developing ' },
    { type: 'url', value: 'qiangguoka.com', href: 'https://qiangguoka.com' },
    { type: 'text', value: '.' }
  ])
  expect(urls('Join xuexi.cn AI channel')).toEqual([{ type: 'url', value: 'xuexi.cn', href: 'https://xuexi.cn' }])
  expect(urls('See (https://en.wikipedia.org/wiki/Foo_(bar)), then www.pennlam.com/journey?x=1, ok')).toEqual([
    {
      type: 'url',
      value: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      href: 'https://en.wikipedia.org/wiki/Foo_(bar)'
    },
    { type: 'url', value: 'www.pennlam.com/journey?x=1', href: 'https://www.pennlam.com/journey?x=1' }
  ])
  expect(urls('上线了 example.com.cn，欢迎访问 http://github.com/Penn-Lam。')).toEqual([
    { type: 'url', value: 'example.com.cn', href: 'https://example.com.cn' },
    { type: 'url', value: 'http://github.com/Penn-Lam', href: 'http://github.com/Penn-Lam' }
  ])
})

test('does not treat file names, frameworks, emails or IPs as URLs', () => {
  for (const text of [
    'Built with Next.js and Node.js',
    'run deploy.sh',
    'mail me@pennlam.com',
    'e.g. v1.2.3',
    'http://127.0.0.1'
  ]) {
    expect(splitTextByUrls(text)).toEqual([{ type: 'text', value: text }])
  }

  expect(splitTextByUrls('')).toEqual([])
})
