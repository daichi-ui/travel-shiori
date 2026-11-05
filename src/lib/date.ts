const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// "2026-12-01" → "2026/12/1(火)"
export function formatDate(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return value
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  return `${y}/${m}/${d}(${weekday})`
}

export function formatPeriod(start: string, end: string) {
  if (start === end) return formatDate(start)
  return `${formatDate(start)} 〜 ${formatDate(end)}`
}
