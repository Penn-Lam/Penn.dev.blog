/**
 * [INPUT]: 只依赖浏览器与 Bun 都有的 URL 构造函数
 * [OUTPUT]: 对外提供 addDefaultProtocol、getUrlHostname、isValidWebsiteUrl、getFaviconUrl、splitTextByUrls
 * [POS]: lib/ 的 URL 纯函数集合。NotionMentionLink 与 UrlFavicon 用它取域名和图标；Journey 用 splitTextByUrls 把纯文本里的网址切成链接片段。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const addDefaultProtocol = (value) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value)

export function getUrlHostname(value) {
  try {
    return new URL(addDefaultProtocol(value)).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function isValidWebsiteUrl(value) {
  if (!value || /\s/.test(value)) return false

  try {
    const url = new URL(addDefaultProtocol(value))
    const labels = url.hostname.split('.')

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      labels.length >= 2 &&
      !/^\d+(?:\.\d+){3}$/.test(url.hostname) &&
      !url.hostname.includes(':') &&
      labels.every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))
    )
  } catch {
    return false
  }
}

export function getFaviconUrl(value) {
  const hostname = getUrlHostname(value)

  return hostname ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32` : null
}

// ==========================================================================
// 纯文本网址切分
// 无协议的裸域名只认白名单顶级域，避免把 Next.js、deploy.sh、e.g. 误判成网址。
// 带 http(s):// 的网址不受白名单限制。
// ==========================================================================

const BARE_URL_TLDS = [
  'ai',
  'app',
  'bio',
  'cc',
  'cn',
  'co',
  'com',
  'dev',
  'fm',
  'gg',
  'hk',
  'io',
  'me',
  'net',
  'org',
  'page',
  'site',
  'studio',
  'tech',
  'tv',
  'uk',
  'us',
  'xyz'
]

// 网址主体不能包含空白、引号、尖括号和全角标点
const URL_BODY = String.raw`[^\s<>"'，。；：！？、（）「」『』【】]`

const DOMAIN_LABEL = String.raw`[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?`

// 前一个字符是单词字符、@、点、斜杠或连字符时不匹配，排除邮箱和路径片段
const URL_PATTERN = new RegExp(
  String.raw`(?<![\w@./-])(?:https?:\/\/${URL_BODY}+|(?:${DOMAIN_LABEL}\.)+(?:${BARE_URL_TLDS.join('|')})(?![a-z\d-])(?:[/?#]${URL_BODY}*)?)`,
  'gi'
)

const TRAILING_PUNCTUATION = /[.,;:!?'"]$/

// 去掉句末标点；右括号只在不成对时去掉，保留 wiki/Foo_(bar) 这类网址
function trimTrailingPunctuation(value) {
  let result = value

  while (result) {
    if (TRAILING_PUNCTUATION.test(result)) {
      result = result.slice(0, -1)
    } else if (result.endsWith(')') && result.split('(').length < result.split(')').length) {
      result = result.slice(0, -1)
    } else {
      break
    }
  }

  return result
}

/**
 * 把纯文本切成文本片段和网址片段，顺序与原文一致，拼回去等于原文。
 * @param {string} text
 * @returns {Array<{ type: 'text', value: string } | { type: 'url', value: string, href: string }>}
 */
export function splitTextByUrls(text) {
  if (!text) return []

  const segments = []
  let cursor = 0

  for (const match of text.matchAll(URL_PATTERN)) {
    const value = trimTrailingPunctuation(match[0])

    if (!isValidWebsiteUrl(value)) continue

    if (match.index > cursor) segments.push({ type: 'text', value: text.slice(cursor, match.index) })
    segments.push({ type: 'url', value, href: addDefaultProtocol(value) })
    cursor = match.index + value.length
  }

  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) })

  return segments
}
