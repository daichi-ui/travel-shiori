const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function parse(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

function toValue(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

// "2026-12-01" → "2026/12/1(火)"
export function formatDate(value: string) {
  const date = parse(value)
  if (!date) return value
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]})`
}

// "2026-12-01" → "12/1(火)"
export function formatShortDate(value: string) {
  const date = parse(value)
  if (!date) return value
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]})`
}

export function formatPeriod(start: string, end: string) {
  if (start === end) return formatDate(start)
  return `${formatDate(start)} - ${formatDate(end)}`
}

// 開始日から終了日までの日付を並べる（"2026-12-01", "2026-12-02", ...）
export function listDays(start: string, end: string) {
  const from = parse(start)
  const to = parse(end)
  if (!from || !to) return []
  const days: string[] = []
  for (const d = from; d <= to; d.setDate(d.getDate() + 1)) days.push(toValue(d))
  return days
}

export function countDays(start: string, end: string) {
  return listDays(start, end).length
}
