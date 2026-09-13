'use client'

import * as HoverCardPrimitive from '@radix-ui/react-hover-card'

import { cn } from '@/lib/utils'

export const HoverCard = HoverCardPrimitive.Root
export const HoverCardTrigger = HoverCardPrimitive.Trigger

export function HoverCardContent({ className, align = 'center', sideOffset = 4, ref, ...props }) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'border-border-button-default bg-background-primary-default z-50 rounded-xl border shadow-xl outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'data-[state=open]:slide-in-from-top-1 data-[state=closed]:zoom-out-95',
          'duration-150',
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}
