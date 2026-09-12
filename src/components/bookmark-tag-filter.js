import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function BookmarkTagFilter({ tags, collectionSlug }) {
  const searchParams = useSearchParams()
  const selectedTag = searchParams.get('tag')

  if (tags.length === 0) return null

  return (
    <div className="border-separator-border mb-6 border-b pb-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/bookmarks/${collectionSlug}`}
          className={`text-body-medium rounded-lg px-3 py-1.5 transition-all duration-200 ${
            !selectedTag
              ? 'from-accent-500 to-accent-600 shadow-nav-selected bg-linear-to-b text-white'
              : 'bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary'
          }`}
        >
          All
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/bookmarks/${collectionSlug}?tag=${encodeURIComponent(tag)}`}
            className={`text-body-medium rounded-lg px-3 py-1.5 transition-all duration-200 ${
              selectedTag === tag
                ? 'from-accent-500 to-accent-600 shadow-nav-selected bg-linear-to-b text-white'
                : 'bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
