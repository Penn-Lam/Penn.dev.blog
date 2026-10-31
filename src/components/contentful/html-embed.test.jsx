import { expect, test } from 'bun:test'

import { RichText } from '@/components/contentful/rich-text'

test('renders only same-origin HTML blocks in a script-only sandbox', () => {
  const block = { nodeType: 'embedded-entry-block', data: { target: { sys: { id: 'replay' } } }, content: [] }

  const render = (htmlUrl) =>
    RichText({
      content: {
        json: { nodeType: 'document', data: {}, content: [block] },
        links: {
          entries: { block: [{ sys: { id: 'replay' }, __typename: 'HtmlEmbed', title: 'Seat replay', htmlUrl }] }
        }
      }
    })[0]

  expect(render('/embeds/imax-gt-replay-02.html').props).toMatchObject({
    embedUrl: '/embeds/imax-gt-replay-02.html',
    title: 'Seat replay',
    sandbox: 'allow-scripts',
    referrerPolicy: 'no-referrer'
  })
  expect(render('https://other.example/replay.html')).toBeNull()
  expect(render('/embeds/../admin.html')).toBeNull()
})
