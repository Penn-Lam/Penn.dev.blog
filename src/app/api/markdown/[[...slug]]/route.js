import { HOME_CONTENT, SECTION_SUMMARIES, SITE_URL, TRUST_PAGES } from '@/data/site-content'
import { getAllPosts, getPage, getPost } from '@/lib/contentful'
import { contentfulDocumentToMarkdown, trustPageToMarkdown } from '@/lib/markdown'
import { getBookmarks } from '@/lib/raindrop'

const STATIC_LINKS = [
  ['Writing', '/writing'],
  ['Journey', '/journey'],
  ['Stack', '/stack'],
  ['Workspace', '/workspace'],
  ['Visual', '/visual'],
  ['Bookmarks', '/bookmarks'],
  ['Friends', '/friends'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Privacy', '/privacy']
]

function response(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': status === 200 ? 'public, s-maxage=300, stale-while-revalidate=86400' : 'no-store',
      Vary: 'Accept, Accept-Encoding'
    }
  })
}

function homeMarkdown() {
  return [
    `# ${HOME_CONTENT.title}`,
    ...HOME_CONTENT.introduction,
    '## Explore',
    ...STATIC_LINKS.map(([label, path]) => `- [${label}](${SITE_URL}${path})`),
    `- [Machine-readable site guide](${SITE_URL}/llms.txt)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`
  ].join('\n\n')
}

async function writingIndexMarkdown() {
  const posts = await getAllPosts()

  return [
    '# Writing',
    SECTION_SUMMARIES.writing,
    '## Articles',
    ...posts.map((post) => `- [${post.title}](${SITE_URL}/writing/${post.slug})`)
  ].join('\n\n')
}

async function resolveMarkdown(pathname) {
  if (pathname === '/') return homeMarkdown()

  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 1 && TRUST_PAGES[segments[0]]) return trustPageToMarkdown(TRUST_PAGES[segments[0]])

  if (pathname === '/writing') return writingIndexMarkdown()

  if (segments.length === 1 && SECTION_SUMMARIES[segments[0]]) {
    const slug = segments[0]

    return `# ${slug[0].toUpperCase()}${slug.slice(1)}\n\n${SECTION_SUMMARIES[slug]}\n\nCanonical page: ${SITE_URL}${pathname}`
  }

  if (segments.length === 2 && segments[0] === 'writing') {
    const post = await getPost(segments[1])

    if (!post) return null

    return `# ${post.title}\n\n${contentfulDocumentToMarkdown(post.content)}`
  }

  if (segments.length === 2 && segments[0] === 'bookmarks') {
    const bookmarks = await getBookmarks()
    const bookmark = bookmarks?.find((item) => item.slug === segments[1])

    if (!bookmark) return null

    return `# ${bookmark.title}\n\nA curated collection containing ${bookmark.count} bookmarks.\n\nCanonical page: ${SITE_URL}${pathname}`
  }

  if (segments.length === 1) {
    const page = await getPage(segments[0])

    if (!page) return null

    return `# ${page.title}\n\n${contentfulDocumentToMarkdown(page.content)}`
  }

  return null
}

export async function GET(_request, { params }) {
  const { slug = [] } = await params
  const pathname = `/${slug.join('/')}`
  const markdown = await resolveMarkdown(pathname)

  if (!markdown) {
    return response(
      `# Not found\n\nNo page exists at this path. Start with the [sitemap](${SITE_URL}/sitemap.xml) or [llms.txt](${SITE_URL}/llms.txt).`,
      404
    )
  }

  return response(markdown)
}
