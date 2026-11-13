/**
 * [INPUT]: 接收陈列条目的 href、title、subtitle
 * [OUTPUT]: 对外提供 ShelfLink 组件
 * [POS]: components/shelves 三种陈列共用的外壳。有链接时是新窗口打开的 a，没有链接时是 span。
 *        实物上不印文字，标题只放在 aria-label 和悬停提示里。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export function ShelfLink({ item, className, children }) {
  const label = item.subtitle ? `${item.title}, ${item.subtitle}` : item.title

  if (!item.href) {
    return (
      <span className={className} title={label} role="img" aria-label={label}>
        {children}
      </span>
    )
  }

  return (
    <a
      className={className}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
    >
      {children}
    </a>
  )
}
