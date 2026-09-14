function renderText(node) {
  let value = node.value || ''

  for (const mark of node.marks || []) {
    if (mark.type === 'bold') value = `**${value}**`

    if (mark.type === 'italic') value = `_${value}_`

    if (mark.type === 'code') value = `\`${value}\``
  }

  return value
}

function renderChildren(node, links) {
  return (node.content || []).map((child) => renderNode(child, links)).join('')
}

function renderList(node, links, ordered) {
  return `${(node.content || [])
    .map((item, index) => {
      const content = renderChildren(item, links).trim().replaceAll('\n', ' ')

      return `${ordered ? `${index + 1}.` : '-'} ${content}`
    })
    .join('\n')}\n\n`
}

function renderNode(node, links) {
  if (!node) return ''

  if (node.nodeType === 'text') return renderText(node)

  const content = renderChildren(node, links)

  if (node.nodeType === 'document') return content.trim()

  if (node.nodeType === 'paragraph') return `${content}\n\n`

  if (node.nodeType.startsWith('heading-')) return `${'#'.repeat(Number(node.nodeType.slice(-1)))} ${content}\n\n`

  if (node.nodeType === 'unordered-list') return renderList(node, links, false)

  if (node.nodeType === 'ordered-list') return renderList(node, links, true)

  if (node.nodeType === 'blockquote')
    return `${content
      .trim()
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n')}\n\n`

  if (node.nodeType === 'hr') return '---\n\n'

  if (node.nodeType === 'hyperlink') return `[${content}](${node.data.uri})`

  if (node.nodeType === 'embedded-asset-block') {
    const id = node.data?.target?.sys?.id
    const asset = links?.assets?.block?.find((item) => item.sys.id === id)

    if (!asset) return ''

    return `![${asset.description || asset.title || ''}](${asset.url})\n\n`
  }

  return content
}

export function contentfulDocumentToMarkdown(content) {
  return renderNode(content?.json, content?.links)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function trustPageToMarkdown(page) {
  return [
    `# ${page.title}`,
    ...page.sections.flatMap((section) => [`## ${section.heading}`, ...section.paragraphs])
  ].join('\n\n')
}
