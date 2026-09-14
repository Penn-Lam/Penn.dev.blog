import Link from 'next/link'
import { Suspense } from 'react'

import { ClientOnly } from '@/components/client-only'
import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { PenflowSignature } from '@/components/penflow-signature'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { SunnyOverlay, SunnyToggle } from '@/components/sunny-mode'
import { WritingList } from '@/components/writing-list'
import { HOME_CONTENT, PROFILE_URLS, SITE_URL } from '@/data/site-content'
import { getAllPosts } from '@/lib/contentful'
import { getItemsByYear, getSortedPosts } from '@/lib/utils'

async function fetchData() {
  const allPosts = await getAllPosts()
  const sortedPosts = getSortedPosts(allPosts)
  const items = getItemsByYear(sortedPosts)

  return { items }
}

export default async function Home() {
  const { items } = await fetchData()

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#penn-lam`,
    name: 'Penn Lam',
    alternateName: '林芃芃',
    url: SITE_URL,
    image: `${SITE_URL}/assets/me.avif`,
    jobTitle: 'AI Agent Developer and Technical Founder',
    description:
      'Shenzhen-based AI agent developer and technical founder working on agent memory infrastructure and AI-first products.',
    sameAs: PROFILE_URLS
  }

  return (
    <ScrollArea useScrollAreaId>
      <SunnyOverlay />
      <FloatingHeader scrollTitle="Penn" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title={HOME_CONTENT.title} className="sr-only" />
          <p aria-hidden="true">
            Hi, I'm Penn Lam（林芃芃） 👋
            <br />
            AI Agent Developer, Technical Founder, and Popping Dancer 🤠
            <br />
            Exploring the possibilities of AIGC.
            <br />
            Born in China, CS undergraduate, Metaverse track, now hacking AI in Shenzhen.
            <br />
            Bridging GenAI × personal computing — let's connect and shape the future together.
          </p>
          <div className="sr-only">
            {HOME_CONTENT.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <SunnyToggle />
          <Link
            href="/writing"
            className="text-text-primary inline-flex underline-offset-4 transition-colors hover:underline"
          >
            <h2 className="mt-8 mb-4">Writing</h2>
          </Link>
          <Suspense fallback={<ScreenLoadingSpinner />}>
            <WritingList items={items} header="Writing" />
          </Suspense>
          <ClientOnly>
            <PenflowSignature />
          </ClientOnly>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
    </ScrollArea>
  )
}
