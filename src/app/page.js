import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { RandomFact } from '@/components/time-greeting'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { TimeGreeting } from '@/components/time-greeting'
import { Button } from '@/components/ui/button'
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
      <FloatingHeader scrollTitle="Penn" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Home" className="lg:hidden" />
          <TimeGreeting className="mb-6" />
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
          <RandomFact />
          <Button asChild variant="link" className="inline px-0">
            <Link href="/writing">
              <h2 className="mt-8 mb-4">Writing</h2>
            </Link>
          </Button>
          <Suspense fallback={<ScreenLoadingSpinner />}>
            <WritingList items={items} header="Writing" />
          </Suspense>
        </div>
      </div>
    </ScrollArea>
  )
}
