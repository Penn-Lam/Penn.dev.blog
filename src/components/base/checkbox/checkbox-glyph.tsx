import { cx } from '@/utils/cx'
import { checkboxSizes, type CheckboxSize } from './checkbox-styles'

export interface CheckboxGlyphState {
  isSelected: boolean
  isIndeterminate: boolean
  isFocusVisible: boolean
  isDisabled: boolean
  isHovered: boolean
}

/**
 * The 16px (or 14px) checkbox box + tick/indeterminate glyph. Shared by the
 * standalone Checkbox and the CheckboxCard so their visuals stay identical.
 */
export function CheckboxGlyph({ state, size = 'md' }: { state: CheckboxGlyphState; size?: CheckboxSize }) {
  const { isSelected, isIndeterminate, isFocusVisible, isDisabled, isHovered } = state
  const s = checkboxSizes[size]
  const isMarked = isSelected || isIndeterminate
  const hover = isHovered && !isDisabled

  return (
    <span
      aria-hidden
      className={cx(
        'flex shrink-0 items-center justify-center rounded-sm',
        'ease transition-[background-color,border-color,box-shadow] duration-150',
        s.box,
        isMarked
          ? cx(
              'shadow-checkbox-selected bg-linear-to-b',
              hover ? 'from-accent-400 to-accent-500' : 'from-accent-500 to-accent-600'
            )
          : cx(
              'bg-background-primary-default border shadow-xs',
              hover ? 'border-border-checkbox-hover' : 'border-border-checkbox-default'
            ),
        isDisabled && 'opacity-50',
        isFocusVisible && 'ring-border-focus-ring ring-2 ring-offset-2'
      )}
    >
      <svg viewBox="0 0 16 16" fill="none" className={s.glyph}>
        {isIndeterminate ? (
          <path d="M4.5 8H8H11.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        ) : isSelected ? (
          <path
            d="M4 7.7002L6.64645 10.3466C6.84171 10.5419 7.15829 10.5419 7.35355 10.3466L12 5.7002"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="animate-check-draw"
          />
        ) : null}
      </svg>
    </span>
  )
}
