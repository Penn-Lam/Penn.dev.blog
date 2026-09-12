'use client'

import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { SendIcon } from '@/components/icons'
import { SubmitBookmarkForm } from '@/components/submit-bookmark/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { SUBMIT_BOOKMARK_FORM_DESCRIPTION, SUBMIT_BOOKMARK_FORM_TITLE } from '@/lib/constants'

export const SubmitBookmarkDialog = ({ bookmarks, currentBookmark }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="xs" leadingIcon={SendIcon} className="relative">
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(event) => {
          // Keep the dialog open when interacting with the bookmark-type select popover (portaled outside the dialog tree)
          if (event.target instanceof Element && event.target.closest('.bookmark-type-select-popover')) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{SUBMIT_BOOKMARK_FORM_TITLE}</DialogTitle>
          <DialogDescription>{SUBMIT_BOOKMARK_FORM_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <SubmitBookmarkForm setFormOpen={setOpen} bookmarks={bookmarks} currentBookmark={currentBookmark} />
      </DialogContent>
    </Dialog>
  )
}
