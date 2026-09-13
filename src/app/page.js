import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { PenflowSignature } from '@/components/penflow-signature'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { SunnyOverlay, SunnyToggle } from '@/components/sunny-mode'
import { WritingList } from '@/components/writing-list'
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

  return (
    <ScrollArea useScrollAreaId>
      <SunnyOverlay />
      <FloatingHeader scrollTitle="Penn" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Home" className="lg:hidden" />
          <p>
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
          <PenflowSignature />
        </div>
      </div>
    </ScrollArea>
  )
}
