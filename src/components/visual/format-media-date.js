const CAPTURED_DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const UPLOADED_DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

export function formatCapturedDate(value) {
  return CAPTURED_DATE_FORMATTER.format(new Date(value))
}

export function formatUploadedDate(value) {
  return UPLOADED_DATE_FORMATTER.format(new Date(value))
}
