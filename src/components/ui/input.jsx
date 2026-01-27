import { cn } from '@/lib/utils'

/**
 * [INPUT]: 依赖 @/lib/utils 的 cn 函数
 * [OUTPUT]: 对外提供 Input 组件，支持 error 变体和文本溢出处理
 * [POS]: components/ui 的基础输入组件，被 Form 组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
function Input({ className, type, error, 'aria-describedby': ariaDescribedBy, ...props }) {
  return (
    <input
      type={type}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={ariaDescribedBy}
      className={cn(
        // 基础样式 - min-w-0 防止 flex 子元素溢出
        'flex h-9 min-w-0 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors',
        // 文本溢出处理
        'overflow-hidden text-overflow:ellipsis whitespace-nowrap',
        // 默认状态
        'border-gray-200 placeholder:text-gray-500',
        // 聚焦状态
        'focus-visible:ring-1 focus-visible:ring-gray-950 focus-visible:outline-hidden',
        // 错误状态 (WCAG 3.3.1)
        error ? 'border-red-500 focus-visible:ring-red-500' : '',
        // 禁用状态
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
