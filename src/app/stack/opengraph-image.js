import { ImageResponse } from 'next/og'

import { OpenGraphImage } from '@/components/og-image'
import { getPageSeo } from '@/lib/contentful'
import { getBoldFont, getRegularFont } from '@/lib/fonts'

export const alt = '工具集'

export const size = { width: 1200, height: 630 }

export const contentType = 'image/png'

export default async function OpengraphImage() {
  let title = '工具集'
  let description = '我日常使用的工具集合'

  try {
    const seoData = await getPageSeo('stack')

    if (seoData?.seo) {
      title = seoData.seo.title || title
      description = seoData.seo.description || description
    }
  } catch (error) {
    console.error('Error loading Stack SEO data:', error)
  }

  const [regularFontData, boldFontData] = await Promise.all([getRegularFont(), getBoldFont()])

  return new ImageResponse(
    <OpenGraphImage
      title={title}
      description={description}
      icon={<span style={{ fontSize: '3rem' }}>🛠️</span>}
      url="stack"
    />,
    {
      ...size,
      fonts: [
        { name: 'iA Writer Quattro S', data: regularFontData, style: 'normal', weight: 400 },
        { name: 'iA Writer Quattro S', data: boldFontData, style: 'normal', weight: 700 }
      ]
    }
  )
}
