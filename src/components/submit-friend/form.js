'use client'

/**
 * [INPUT]: 依赖 zod 验证、react-hook-form、BoardUI notification
 * [OUTPUT]: 对外提供 SubmitFriendForm 组件
 * [POS]: components/submit-friend 的核心表单组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Avatar } from '@/components/base/avatar/avatar'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import {
  EnvelopeSimpleIcon,
  GithubIcon,
  Link02Icon,
  PencilEdit01Icon,
  UserCircleIcon,
  UserIcon
} from '@/components/icons'
import { notify } from '@/components/notifications'
import { Form, FormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'

const avatarUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' && value && !/^https?:\/\//i.test(value) ? `https://${value}` : value),
  z.string().url({ message: 'Invalid URL.' }).or(z.literal('')).optional()
)

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  url: z.string().url({ message: 'Invalid URL.' }),
  avatar: avatarUrlSchema,
  github: z.string().optional().or(z.literal('')),
  signature: z
    .string()
    .regex(/^[^\p{Script=Han}]*$/u, { message: 'Chinese characters are not supported.' })
    .optional(),
  email: z.string().email({ message: 'Invalid email.' }).or(z.literal('')).optional()
})

export const SubmitFriendForm = memo(({ className, setFormOpen }) => {
  const [isSubmittingLocked, setIsSubmittingLocked] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { name: '', url: '', avatar: '', github: '', signature: '', email: '' }
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = useCallback(
    async (values) => {
      if (isSubmittingLocked) return
      setIsSubmittingLocked(true)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        const response = await fetch('/api/submit-friend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait before submitting again.')
          }
          throw new Error(data.error || 'Submission failed')
        }

        form.reset()
        notify.success(
          <p>
            Thanks! I&apos;ll review <span className="underline underline-offset-4">{values.name}</span> soon.
          </p>,
          { duration: 5000 }
        )
      } catch (error) {
        notify.error('Friend link submission failed', error.message || 'An unexpected error occurred.')
      } finally {
        setIsSubmittingLocked(false)
        setFormOpen(false)
      }
    },
    [form, setFormOpen, isSubmittingLocked]
  )

  const fields = useMemo(
    () => [
      { name: 'name', label: 'Name', placeholder: 'Enter your name', icon: UserIcon, required: true },
      { name: 'signature', label: 'Signature', placeholder: 'Enter your signature', icon: PencilEdit01Icon },
      {
        name: 'url',
        label: 'Website URL',
        placeholder: 'Enter your url',
        icon: Link02Icon,
        required: true,
        fullWidth: true
      },
      { name: 'avatar', label: 'Avatar URL', placeholder: 'Enter your avatar url', fullWidth: true },
      { name: 'github', label: 'GitHub', placeholder: 'Enter your GitHub username', icon: GithubIcon, fullWidth: true },
      { name: 'email', label: 'Email', placeholder: 'Enter your email', icon: EnvelopeSimpleIcon, fullWidth: true }
    ],
    []
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid grid-cols-2 gap-4', className)} noValidate>
        {fields.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field, fieldState }) => (
              <Input
                className={f.fullWidth ? 'col-span-2' : undefined}
                label={f.label}
                isRequired={f.required}
                placeholder={f.placeholder}
                leadingIcon={f.icon}
                leadingAddon={
                  f.name === 'avatar' ? (
                    field.value ? (
                      <Avatar size="sm" src={avatarUrlSchema.safeParse(field.value).data || undefined} />
                    ) : (
                      <UserCircleIcon className="size-6 shrink-0" aria-hidden />
                    )
                  ) : undefined
                }
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                isInvalid={!!fieldState.error}
                hint={fieldState.error?.message}
              />
            )}
          />
        ))}
        <Button type="submit" className="col-span-2 w-full" disabled={isSubmitting || !isValid}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
})
SubmitFriendForm.displayName = 'SubmitFriendForm'
