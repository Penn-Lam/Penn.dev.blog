import Link from 'next/link'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'

const TRUST_LINKS = [
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Privacy', '/privacy']
]

export function TrustPage({ page }) {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle={page.title} />
      <div className="content-wrapper">
        <article className="content">
          <PageTitle title={page.title} />
          {page.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="text-title-3-semibold mb-3">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-body-regular text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <nav aria-label="Trust pages" className="border-separator-border flex flex-wrap gap-4 border-t pt-6">
            {TRUST_LINKS.map(([label, href]) => (
              <Link key={href} href={href} className="text-accent-600 underline-offset-3 hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </article>
      </div>
    </ScrollArea>
  )
}
