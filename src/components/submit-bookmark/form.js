'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useId, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'
import { Select, SelectItem } from '@/components/base/select/select'
import { getDelightfulMessage } from '@/components/console-easter-egg'
import { EnvelopeSimpleIcon, Link02Icon } from '@/components/icons'
import { notify } from '@/components/notifications'
import { formSchema } from '@/components/submit-bookmark/utils'
import { Form, FormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 zod 验证、react-hook-form、BoardUI notification
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
    'Bookmark saved! Your knowledge graph grows.',
    "Nice catch! That's a great find.",
    'Added to your collection. Well done!',
    'Saved for later. Your future self will thank you.',
    'Another gem for your digital garden.',
    'Indexed and ready for retrieval.'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export const SubmitBookmarkForm = memo(({ className, setFormOpen, bookmarks, currentBookmark }) => {
  const [isPending, startTransition] = useTransition()
  const [retryCount, setRetryCount] = useState(0)
  const typeLabelId = useId()

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
        const successMessages = [getRandomSuccessMessage(), getDelightfulMessage('bookmarkSubmit')]
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]

        notify.success(
          <div className="space-y-1">
            <p>{randomMessage}</p>
            <p className="text-caption-1-regular text-text-tertiary">
              <span className="underline underline-offset-4">{values.url}</span>
            </p>
          </div>,
          { duration: 5000 }
        )
      } catch (error) {
        const errorMessage = getNetworkErrorMessage(error)
        notify.error('Bookmark submission failed', errorMessage, {
          actions:
            retryCount < 3
              ? [
                  {
                    label: 'Retry',
                    variant: 'primary',
                    onClick: () => {
                      setRetryCount((c) => c + 1)
                      onSubmit(values)
                    }
                  }
                ]
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
    ({ field, fieldState }) => (
      <Input
        label="Website URL"
        isRequired
        placeholder="Enter your url"
        leadingIcon={Link02Icon}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        isInvalid={!!fieldState.error}
        hint={fieldState.error?.message}
      />
    ),
    []
  )

  const renderEmailField = useCallback(
    ({ field, fieldState }) => (
      <Input
        label="Email"
        isRequired
        placeholder="Enter your email"
        leadingIcon={EnvelopeSimpleIcon}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        isInvalid={!!fieldState.error}
        hint={fieldState.error?.message}
      />
    ),
    []
  )

  const renderTypeField = useCallback(
    ({ field, fieldState }) => (
      <div className="flex w-full flex-col items-start gap-1">
        <Label id={typeLabelId}>Type</Label>
        <Select
          className="w-full"
          aria-labelledby={typeLabelId}
          selectedKey={field.value || null}
          onSelectionChange={(key) => field.onChange(key ?? '')}
          popoverClassName="bookmark-type-select-popover"
          renderValue={({ defaultChildren, isPlaceholder }) =>
            isPlaceholder ? <span className="text-text-tertiary">Select a bookmark type</span> : defaultChildren
          }
        >
          {bookmarks.map((bookmark) => (
            <SelectItem key={bookmark.slug} id={bookmark.title}>
              {bookmark.title}
            </SelectItem>
          ))}
        </Select>
        <p className="text-caption-1-medium text-text-secondary pt-px">
          Optional but helps me categorize the bookmark.
        </p>
        {fieldState.error && (
          <p className="text-caption-1-medium text-text-error-primary pt-px">{fieldState.error.message}</p>
        )}
      </div>
    ),
    [bookmarks, typeLabelId]
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
