'use client'

import { SendIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { SubmitBookmarkForm } from '@/components/submit-bookmark/form'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { SUBMIT_BOOKMARK_FORM_DESCRIPTION, SUBMIT_BOOKMARK_FORM_TITLE } from '@/lib/constants'

export const SubmitBookmarkDrawer = ({ bookmarks, currentBookmark }) => {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="xs" leadingIcon={SendIcon} className="relative">
          Submit
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="px-6"
        onPointerDownOutside={(event) => {
          // Keep the drawer open when interacting with the bookmark-type select popover (portaled outside the drawer tree)
          if (event.target instanceof Element && event.target.closest('.bookmark-type-select-popover')) {
            event.preventDefault()
          }
        }}
      >
        <DrawerHeader className="sm:text-center">
          <DrawerTitle>{SUBMIT_BOOKMARK_FORM_TITLE}</DrawerTitle>
          <DrawerDescription className="m-0">{SUBMIT_BOOKMARK_FORM_DESCRIPTION}</DrawerDescription>
        </DrawerHeader>
        <SubmitBookmarkForm
          setFormOpen={setOpen}
          bookmarks={bookmarks}
          currentBookmark={currentBookmark}
          className="py-8"
        />
      </DrawerContent>
    </Drawer>
  )
}
