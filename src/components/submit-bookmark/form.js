'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { formSchema } from '@/components/submit-bookmark/utils'
import { getDelightfulMessage } from '@/components/console-easter-egg'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 zod 验证、react-hook-form、sonner toast
 * [OUTPUT]: 对外提供 SubmitBookmarkForm 组件，提交书签表单
 * [POS]: components/submit-bookmark 的核心表单组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 网络错误状态
const NETWORK_ERRORS = {
  TIMEOUT: 'Request timed out. Please check your connection.',
  OFFLINE: 'You appear to be offline. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
}

/**
 * 处理网络错误
 * @param {Error} error - 错误对象
 * @returns {string} 用户友好的错误消息
 */
function getNetworkErrorMessage(error) {
  if (!navigator.onLine) {
    return NETWORK_ERRORS.OFFLINE
  }
  if (error.message?.includes('timed out') || error.name === 'TimeoutError') {
    return NETWORK_ERRORS.TIMEOUT
  }
  if (error.message?.includes('500') || error.message?.includes('server')) {
    return NETWORK_ERRORS.SERVER_ERROR
  }
  return error.message || NETWORK_ERRORS.UNKNOWN
}

// 获取随机 delightful 消息
function getRandomSuccessMessage() {
  const messages = [
    '📚 Bookmark saved! Your knowledge graph grows.',
    '🎯 Nice catch! That\'s a great find.',
    '⭐ Added to your collection. Well done!',
    '🔖 Saved for later. Your future self will thank you.',
    '✨ Another gem for your digital garden.',
    '📝 Indexed and ready for retrieval.'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export const SubmitBookmarkForm = memo(({ className, setFormOpen, bookmarks, currentBookmark }) => {
  const [isPending, startTransition] = useTransition()
  const [retryCount, setRetryCount] = useState(0)

  // 表单选项 - 包含类型验证
  const memoizedFormOptions = useMemo(
    () => ({
      resolver: zodResolver(formSchema),
      mode: 'onChange',
      defaultValues: {
        url: '',
        email: '',
        type: currentBookmark?.title ?? ''
      }
    }),
    [currentBookmark]
  )

  const form = useForm(memoizedFormOptions)
  const formState = useMemo(() => form.formState, [form.formState])
  const { isSubmitting, errors, isValid } = formState

  // 防止重复提交
  const [isSubmittingLocked, setIsSubmittingLocked] = useState(false)

  const onSubmit = useCallback(
    async (values) => {
      if (isSubmittingLocked) return

      setIsSubmittingLocked(true)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s 超时

        const response = await fetch('/api/submit-bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...values }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (!response.ok) {
          // 处理速率限制
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait before submitting again.')
          }
          throw new Error(data.error || 'Submission failed')
        }

        // 成功 - 使用 delightful 消息
        form.reset()
        setRetryCount(0)

        // 随机成功消息
        const successMessages = [
          getRandomSuccessMessage(),
          getDelightfulMessage('bookmarkSubmit')
        ]
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]

        toast.success('Bookmark submitted', {
          description: (
            <div className="space-y-1">
              <p>{randomMessage}</p>
              <p className="text-xs text-gray-500">
                <span className="underline underline-offset-4">{values.url}</span>
              </p>
            </div>
          ),
          duration: 5000
        })
      } catch (error) {
        const errorMessage = getNetworkErrorMessage(error)
        toast.error(errorMessage, {
          action: retryCount < 3
            ? {
                label: 'Retry',
                onClick: () => {
                  setRetryCount((c) => c + 1)
                  onSubmit(values)
                }
              }
            : undefined
        })
      } finally {
        setIsSubmittingLocked(false)
        startTransition(() => {
          setFormOpen(false)
        })
      }
    },
    [form, setFormOpen, isSubmittingLocked, retryCount]
  )

  const renderUrlField = useCallback(
    ({ field }) => (
      <FormItem>
        <FormLabel>
          Website URL
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </FormLabel>
        <FormControl>
          <Input
            placeholder="https://example.com"
            {...field}
            aria-required="true"
            aria-describedby={field.name === 'url' ? 'url-hint' : undefined}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    []
  )

  const renderEmailField = useCallback(
    ({ field }) => (
      <FormItem>
        <FormLabel>
          Email
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </FormLabel>
        <FormControl>
          <Input placeholder="johndoe@gmail.com" {...field} aria-required="true" />
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    []
  )

  const renderTypeField = useCallback(
    ({ field }) => (
      <FormItem>
        <FormLabel>Type</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger aria-describedby="type-description">
              <SelectValue placeholder="Select a bookmark type" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {/* 空选项 */}
            <SelectItem value="" disabled>
              <span className="text-gray-400">Select a type...</span>
            </SelectItem>
            {bookmarks.map((bookmark) => (
              <SelectItem key={bookmark.slug} value={bookmark.title}>
                {bookmark.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormDescription id="type-description">Optional but helps me categorize the bookmark.</FormDescription>
        <FormMessage />
      </FormItem>
    ),
    [bookmarks]
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6', className)}
        noValidate
        aria-label="Submit bookmark form"
      >
        <FormField control={form.control} name="url" render={renderUrlField} />
        <FormField control={form.control} name="email" render={renderEmailField} />
        <FormField control={form.control} name="type" render={renderTypeField} />
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isPending || errors?.api?.limitError || !isValid}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key="submitting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                Submitting...
              </motion.span>
            </AnimatePresence>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  )
})
SubmitBookmarkForm.displayName = 'SubmitBookmarkForm'
