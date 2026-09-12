'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export const ListItem = ({ title, description, path }) => {
  const pathname = usePathname()
  const isActive = pathname === path

  return (
    <Link
      key={path}
      href={path}
      className={cn(
        'rounded-2lg flex flex-col gap-1 p-2 transition-colors duration-300 *:transition-colors *:duration-300',
        isActive
          ? 'from-accent-500 to-accent-600 shadow-nav-selected bg-linear-to-b text-white'
          : 'hover:bg-background-secondary-hover'
      )}
    >
      <span className={cn('text-body-medium', isActive && 'text-white')}>{title}</span>
      {description && (
        <span className={cn('text-body-regular', isActive ? 'text-white/80' : 'text-text-secondary')}>
          {description}
        </span>
      )}
    </Link>
  )
}
