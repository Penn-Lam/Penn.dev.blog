/**
 * [INPUT]: 依赖 @/data/friends.json 的友链数据，@/components/friend-card、@/components/submit-friend/dialog
 * [OUTPUT]: 对外提供 FriendsPage 页面组件和 generateMetadata 元数据
 * [POS]: app/friends/ 的页面入口，友链展示页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { FloatingHeader } from '@/components/floating-header'
import { FriendCard } from '@/components/friend-card'
import { GradientBg5 } from '@/components/gradient-bg'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SubmitFriendDialog } from '@/components/submit-friend/dialog'
import friendsData from '@/data/friends.json'
import { getPageSeo } from '@/lib/contentful'

export default function FriendsPage() {
  return (
    <ScrollArea>
      <GradientBg5 />
      <FloatingHeader title="Friends" />
      <div className="content-wrapper">
        <div className="content">
          <div className="mb-6 flex items-center justify-between">
            <PageTitle title="Friends" className="mb-0" />
            <SubmitFriendDialog />
          </div>
          <p className="mb-10 leading-relaxed text-gray-600">
            Write code and tinker with fun things in our own corners — then meet here.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {friendsData.friends.map((friend) => (
              <FriendCard key={friend.url} friend={friend} />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

export async function generateMetadata() {
  const seoData = await getPageSeo('friends')
  const fallback = {
    title: 'Friends',
    description: '互联网上志同道合的朋友们'
  }

  const seo = seoData?.seo || {}
  const title = seo.title || fallback.title
  const description = seo.description || fallback.description

  return {
    title,
    description,
    openGraph: { title, description, url: '/friends' },
    alternates: { canonical: '/friends' }
  }
}
