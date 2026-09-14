'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { CloseButton } from '@/components/base/buttons/close-button'
import { Textarea } from '@/components/base/textarea/textarea'
import { PlusSignIcon, SendIcon } from '@/components/icons'
import { notify } from '@/lib/notifications'

// 创建全局对话框状态 Context
const DialogStateContext = createContext({
  isQuickPostOpen: false,
  setIsQuickPostOpen: () => {}
})

export function DialogStateProvider({ children }) {
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false)

  return (
    <DialogStateContext.Provider value={{ isQuickPostOpen, setIsQuickPostOpen }}>
      {children}
    </DialogStateContext.Provider>
  )
}

export function useDialogState() {
  return useContext(DialogStateContext)
}

export function QuickPostButton() {
  const { isQuickPostOpen: isOpen, setIsQuickPostOpen: setIsOpen } = useDialogState()
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState('Public') // 单选：Public/Private
  const [categoryTags, setCategoryTags] = useState(['Daily']) // 复选：分类标签
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 监听对话框状态，在打开时禁用数字快捷键
  useEffect(() => {
    if (isOpen) {
      // 禁用数字快捷键
      const disableKeyPress = (e) => {
        if (e.key >= '1' && e.key <= '8') {
          e.preventDefault()
        }
      }

      window.addEventListener('keydown', disableKeyPress)

      return () => window.removeEventListener('keydown', disableKeyPress)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/musings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: content,
          labels: [visibility, ...categoryTags]
        })
      })

      if (response.ok) {
        notify.success('Musing published successfully!')
        setContent('')
        setVisibility('Public')
        setCategoryTags(['Daily'])
        setIsOpen(false)

        // 先触发 git-thoughts 仓库的 GitHub Action 来更新 issues.json
        try {
          notify.info('Updating content...', undefined, { duration: 2000 })

          // 等待几秒让 GitHub Action 完成
          setTimeout(async () => {
            try {
              const revalidateResponse = await fetch('/api/revalidate?path=/musings', {
                method: 'POST'
              })

              if (revalidateResponse.ok) {
                console.info('Page cache revalidated successfully')
                notify.info('Content updated! Refreshing page...')
                // 延迟 1 秒后刷新页面
                setTimeout(() => {
                  window.location.reload()
                }, 1000)
              } else {
                console.error('Failed to revalidate cache, falling back to normal reload')
                window.location.reload()
              }
            } catch (revalidateError) {
              console.error('Revalidate request failed:', revalidateError)
              window.location.reload()
            }
          }, 10000) // 等待 10 秒让 GitHub Action 完成
        } catch (err) {
          console.error('Error in post-publish process:', err)
          // 即使出错也刷新页面
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      } else {
        const errorText = await response.text()
        notify.error('Failed to publish', errorText)
      }
    } catch (error) {
      console.error('Submit error:', error)
      notify.error('Failed to publish musing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = [
    'Idea',
    'Quote',
    'Reflection',
    'Daily',
    'Wealth',
    'Toybox',
    'Coffee',
    'Work',
    'Workout',
    'Wisdom'
  ]

  const toggleCategoryTag = (tag) => {
    if (categoryTags.includes(tag)) {
      setCategoryTags(categoryTags.filter((t) => t !== tag))
    } else {
      setCategoryTags([...categoryTags, tag])
    }
  }

  if (!isOpen) {
    return (
      <Button size="small" leadingIcon={PlusSignIcon} onClick={() => setIsOpen(true)}>
        New Musing
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="border-border-button-default bg-background-primary-default w-full max-w-lg rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-title-3-semibold">Create New Musing</h2>
          <CloseButton size="md" aria-label="Close" onClick={() => setIsOpen(false)} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={setContent}
              isRequired
              placeholder={'Share your thoughts...\n\n💡 Remember to include the verification code at the end'}
              resize="none"
              rows={6}
            />
            <div className="border-status-yellow-background bg-status-yellow-background/40 rounded-md border p-3">
              <div className="flex items-start">
                <div className="text-status-yellow-text text-caption-1-regular">
                  <strong>📝 Publishing Note:</strong> This system uses GitHub Issues as a backend. Please include the
                  verification code at the end of your content. The code will be automatically removed and won't appear
                  in the final published content.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* Visibility selection */}
            <div className="mb-4">
              <label className="text-body-medium text-text-secondary">Visibility</label>
              <div className="mt-2 flex gap-2">
                {['Public', 'Private'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVisibility(option)}
                    className={`text-caption-1-medium rounded-full px-3 py-1 transition-colors ${
                      visibility === option
                        ? 'bg-accent-100 text-accent-800'
                        : 'bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Category tags selection */}
            <div>
              <label className="text-body-medium text-text-secondary">Category Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleCategoryTag(tag)}
                    className={`text-caption-1-medium rounded-full px-3 py-1 transition-colors ${
                      categoryTags.includes(tag)
                        ? 'bg-accent-100 text-accent-800'
                        : 'bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" size="small" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="small" leadingIcon={SendIcon} disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
