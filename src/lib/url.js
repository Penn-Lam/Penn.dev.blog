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
