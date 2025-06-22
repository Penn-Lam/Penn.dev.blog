import 'server-only'

import { cache } from 'react'

import { isDevelopment } from '@/lib/utils'

const fetchGraphQL = cache(async (query, preview = isDevelopment) => {
  const accessToken = preview
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN

  if (!process.env.CONTENTFUL_SPACE_ID || !accessToken) {
    const missingVars = [
      !process.env.CONTENTFUL_SPACE_ID && 'CONTENTFUL_SPACE_ID',
      !accessToken && (preview ? 'CONTENTFUL_PREVIEW_ACCESS_TOKEN' : 'CONTENTFUL_ACCESS_TOKEN')
    ]
      .filter(Boolean)
      .join(', ')
    throw new Error(
      `Contentful environment variable(s) are not set: ${missingVars}. Please check your .env.local file.`
    )
  }

  try {
    const res = await fetch(`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`, {
      cache: isDevelopment ? 'no-store' : 'force-cache',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    })

    if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`Failed to fetch from Contentful. Status: ${res.status}. Body: ${errorBody}`)
    }
    const json = await res.json()
    if (json.errors) {
      throw new Error(`Contentful GraphQL Errors: ${json.errors.map((e) => e.message).join('\n')}`)
    }
    return json
  } catch (error) {
    throw new Error('Failed to fetch data from Contentful. Please check server logs for more details.')
  }
})

// https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#preloading-data
export const preloadGetAllPosts = (preview = isDevelopment) => {
  void getAllPosts(preview)
}

export const getAllPosts = cache(async (preview = isDevelopment) => {
  try {
    const entries = await fetchGraphQL(
      `query {
        postCollection(preview: ${preview}) {
          items {
            title
            slug
            date
            sys {
              firstPublishedAt
              publishedAt
            }
          }
        }
      }`,
      preview
    )

    return entries?.data?.postCollection?.items ?? []
  } catch (error) {
    console.info(error)
    return []
  }
})

export const getPost = cache(async (slug, preview = isDevelopment) => {
  try {
    const entry = await fetchGraphQL(
      `query {
        postCollection(where: { slug: "${slug}" }, preview: ${preview}, limit: 1) {
          items {
            title
            slug
            date
            seo {
              ... on Seo {
                title
                description
              }
            }
            content {
              json
              links {
                assets {
                  block {
                    sys {
                      id
                    }
                    url(transform: {
                      format: AVIF,
                      quality: 50
                    })
                    title
                    width
                    height
                    description
                    contentfulMetadata {
                      tags {
                        name
                      }
                    }
                  }
                }
                entries {
                  inline {
                    sys {
                      id
                    }
                    __typename
                    ... on ContentEmbed {
                      title
                      embedUrl
                      type
                    }
                    ... on CodeBlock {
                      title
                      code
                    }
                    ... on Tweet {
                      id
                    }
                    ... on Carousel {
                      imagesCollection {
                        items {
                          title
                          description
                          url(transform: {
                            format: AVIF,
                            quality: 50
                          })
                        }
                      }
                    }
                  }
                }
              }
            }
            sys {
              firstPublishedAt
              publishedAt
            }
          }
        }
      }`,
      preview
    )

    const data = entry?.data?.postCollection?.items?.[0]
    if (!data) return null

    // Ensure the data structure is complete with fallbacks
    return {
      ...data,
      title: data.title || 'Untitled',
      seo: data.seo || {},
      content: data.content || { json: null },
      sys: data.sys || {}
    }
  } catch (error) {
    console.info(error)
    return null
  }
})

export const getWritingSeo = cache(async (slug, preview = isDevelopment) => {
  try {
    const entry = await fetchGraphQL(
      `query {
        postCollection(where: { slug: "${slug}" }, preview: ${preview}, limit: 1) {
          items {
            date
            seo {
              ... on Seo {
                title
                description
                ogImageTitle
                ogImageSubtitle
                keywords
              }
            }
            sys {
              firstPublishedAt
              publishedAt
            }
          }
        }
      }`,
      preview
    )

    const data = entry?.data?.postCollection?.items?.[0]
    if (!data) return null

    // Ensure the data structure is complete with fallbacks
    return {
      ...data,
      seo: data.seo || {},
      sys: data.sys || {}
    }
  } catch (error) {
    console.info(error)
    return null
  }
})

export const getPageSeo = cache(async (slug, preview = isDevelopment) => {
  try {
    const entry = await fetchGraphQL(
      `query {
        pageCollection(where: { slug: "${slug}" }, preview: ${preview}, limit: 1) {
          items {
            seo {
              ... on Seo {
                title
                description
                ogImageTitle
                ogImageSubtitle
                keywords
              }
            }
          }
        }
      }`,
      preview
    )

    return entry?.data?.pageCollection?.items?.[0] ?? null
  } catch (error) {
    console.info(error)
    return null
  }
})

export const getAllPageSlugs = cache(async (preview = isDevelopment) => {
  try {
    const entries = await fetchGraphQL(
      `query {
        pageCollection(preview: ${preview}) {
          items {
            slug
            hasCustomPage
            sys {
              id
              firstPublishedAt
              publishedAt
            }
          }
        }
      }`,
      preview
    )

    return entries?.data?.pageCollection?.items ?? []
  } catch (error) {
    console.info(error)
    return []
  }
})

export const getAllPostSlugs = cache(async (preview = isDevelopment) => {
  try {
    const entries = await fetchGraphQL(
      `query {
        postCollection(preview: ${preview}) {
          items {
            slug
          }
        }
      }`,
      preview
    )

    return entries?.data?.postCollection?.items ?? []
  } catch (error) {
    console.info(error)
    return []
  }
})

export const getPage = cache(async (slug, preview = isDevelopment) => {
  try {
    const entry = await fetchGraphQL(
      `query {
        pageCollection(where: { slug: "${slug}" }, preview: ${preview}, limit: 1) {
          items {
            title
            slug
            content {
              json
              links {
                assets {
                  block {
                    sys {
                      id
                    }
                    url(transform: {
                      format: AVIF,
                      quality: 50
                    })
                    title
                    width
                    height
                    description
                  }
                }
              }
            }
            sys {
              id
              firstPublishedAt
              publishedAt
            }
          }
        }
      }`,
      preview
    )

    return entry?.data?.pageCollection?.items?.[0] ?? null
  } catch (error) {
    console.info(error)
    return null
  }
})

export const getAllLogbook = cache(async (preview = isDevelopment) => {
  try {
    const entries = await fetchGraphQL(
      `query {
        logbookCollection(order: date_DESC, preview: ${preview}) {
          items {
            title
            date
            description {
              json
            }
            image {
              url(transform: {
                format: AVIF,
                quality: 50
              })
              title
              description
              width
              height
            }
          }
        }
      }`,
      preview
    )

    return entries?.data?.logbookCollection?.items ?? []
  } catch (error) {
    console.info(error)
    return []
  }
})
