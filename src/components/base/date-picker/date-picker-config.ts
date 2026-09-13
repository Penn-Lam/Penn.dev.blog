import { getLocalTimeZone, type CalendarDate } from '@internationalized/date'
import { cx } from '@/utils/cx'

const TRIGGER_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

export function formatTriggerDate(date: CalendarDate) {
  return TRIGGER_DATE_FORMATTER.format(date.toDate(getLocalTimeZone()))
}

export const triggerButtonClassName = cx(
  'inline-flex shrink-0 cursor-pointer items-center gap-0.5 rounded-2lg border border-border-button-default bg-background-primary-default p-2 shadow-xs outline-none',
  'transition-[background-color,border-color,box-shadow] duration-150 ease',
  'hover:bg-background-primary-hover hover:border-border-button-hover',
  'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus-ring',
  'disabled:cursor-not-allowed disabled:bg-background-primary-disabled disabled:text-text-tertiary disabled:shadow-none'
)

export const popoverClassName = cx(
  'origin-top rounded-3xl bg-background-secondary-default shadow-dropdown',
  'transition duration-150 ease-out',
  'data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:blur-[2px]',
  'data-[exiting]:opacity-0 data-[exiting]:scale-95 data-[exiting]:blur-[2px]'
)
