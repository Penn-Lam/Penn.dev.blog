'use client'

/**
 * [INPUT]: 依赖 SubmitFriendForm 组件、ui/dialog、ui/button
 * [OUTPUT]: 对外提供 SubmitFriendDialog 组件
 * [POS]: components/submit-friend 的 Dialog 包装
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { SendIcon } from 'lucide-react'
import { useState } from 'react'

import { SubmitFriendForm } from '@/components/submit-friend/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export const SubmitFriendDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="xs" className="relative">
          <SendIcon size={16} className="mr-2" />
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a friend link</DialogTitle>
          <DialogDescription>Share your site and I'll add you to the friends page after review.</DialogDescription>
        </DialogHeader>
        <SubmitFriendForm setFormOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}
