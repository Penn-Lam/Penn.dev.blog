import katex from 'katex'

// Keep unmatched delimiters and escaped dollars as ordinary text.
export function renderLatex(text) {
  const pattern = /(?<!\\)(\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$)/g
  const parts = []
  let cursor = 0

  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) parts.push({ type: 'text', text: text.slice(cursor, match.index) })
    const display = match[2] !== undefined || match[3] !== undefined
    const source = match[2] ?? match[3] ?? match[4] ?? match[5]

    try {
      parts.push({
        type: 'math',
        source: match[0],
        display,
        html: katex.renderToString(source, { displayMode: display, throwOnError: true, trust: false, maxExpand: 1000 })
      })
    } catch {
      parts.push({ type: 'text', text: match[0] })
    }

    cursor = match.index + match[0].length
  }

  if (cursor < text.length) parts.push({ type: 'text', text: text.slice(cursor) })

  return parts
}
