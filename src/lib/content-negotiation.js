const REPRESENTATIONS = ['text/html', 'text/markdown']

function parseAccept(header) {
  return header.split(',').flatMap((raw) => {
    const [rawType, ...parameters] = raw
      .trim()
      .split(';')
      .map((part) => part.trim())

    const type = rawType.toLowerCase()

    if (!type.includes('/')) return []

    let quality = 1

    for (const parameter of parameters) {
      const [name, value] = parameter.split('=').map((part) => part.trim())

      if (name.toLowerCase() !== 'q') continue

      const parsed = Number(value)
      quality = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(1, parsed))
    }

    const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2

    return [{ type, quality, specificity }]
  })
}

function matches(entry, candidate) {
  if (entry.type === '*/*') return true

  if (entry.type.endsWith('/*')) return candidate.startsWith(entry.type.slice(0, -1))

  return entry.type === candidate
}

export function preferredRepresentation(header) {
  if (!header) return REPRESENTATIONS[0]

  const entries = parseAccept(header)

  if (entries.length === 0) return null

  let best = null

  for (const candidate of REPRESENTATIONS) {
    let match = null

    for (const [position, entry] of entries.entries()) {
      if (!matches(entry, candidate)) continue

      if (!match || entry.specificity > match.specificity) match = { ...entry, position }
    }

    if (!match || match.quality <= 0) continue

    if (!best || match.quality > best.quality || (match.quality === best.quality && match.position < best.position)) {
      best = { type: candidate, quality: match.quality, position: match.position }
    }
  }

  return best?.type ?? null
}

export function appendNegotiationVary(headers) {
  const existing = headers.get('Vary')

  const tokens = existing
    ? existing
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean)
    : []

  const lowerCaseTokens = new Set(tokens.map((token) => token.toLowerCase()))

  for (const token of ['Accept', 'Accept-Encoding']) {
    if (!lowerCaseTokens.has(token.toLowerCase())) tokens.push(token)
  }

  headers.set('Vary', tokens.join(', '))
}
