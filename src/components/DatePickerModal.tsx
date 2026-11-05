import { useState } from 'react'
import { CHARACTERS } from './Character'
import { formatDate, parseDate, toDateValue, WEEKDAYS } from '../lib/date'

// カレンダーから日付を選ぶモーダル。rangeStart / rangeEnd を渡すと、その間を色付けする
export function DatePickerModal({
  title,
  quote,
  value,
  min,
  rangeStart,
  rangeEnd,
  onDone,
  onCancel,
}: {
  title: string
  quote: string
  value: string // "2026-12-01"、未選択なら ""
  min?: string // これより前の日は選べない
  rangeStart?: string
  rangeEnd?: string
  onDone: (value: string) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState(value)
  // 最初に表示する月：選んでいる日 → 選べる最初の日 → 今日
  const [month, setMonth] = useState(() => {
    const base = parseDate(value) ?? parseDate(min ?? '') ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const today = toDateValue(new Date())
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const blanks = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => toDateValue(new Date(year, monthIndex, i + 1)))

  // 色付けする範囲（選択中の日も反映して、選びながら期間が見えるようにする）
  const from = rangeStart ?? selected
  const to = rangeEnd ?? selected

  const moveMonth = (delta: number) => setMonth(new Date(year, monthIndex + delta, 1))

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog date-picker"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-character compact">
          <img src={CHARACTERS.tamama.src} alt="" width={52} height={52} />
          <div>
            <h2>{title}</h2>
            <p className="dialog-quote">{quote}</p>
          </div>
        </div>

        <div className="calendar-header">
          <button type="button" className="month-button" aria-label="前の月" onClick={() => moveMonth(-1)}>
            ‹
          </button>
          <span className="calendar-month">
            {year}年 {monthIndex + 1}月
          </span>
          <button type="button" className="month-button" aria-label="次の月" onClick={() => moveMonth(1)}>
            ›
          </button>
        </div>

        <div className="calendar">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className={`calendar-weekday weekday-${i}`}>
              {w}
            </span>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {days.map((day, i) => {
            const weekday = (blanks + i) % 7
            const disabled = !!min && day < min
            const inRange = !!from && !!to && day >= from && day <= to
            const classes = [
              'calendar-day',
              `weekday-${weekday}`,
              day === selected ? 'selected' : '',
              inRange ? 'in-range' : '',
              day === today ? 'today' : '',
            ]
            return (
              <button
                key={day}
                type="button"
                className={classes.filter(Boolean).join(' ')}
                disabled={disabled}
                aria-pressed={day === selected}
                aria-label={formatDate(day)}
                onClick={() => setSelected(day)}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <p className="calendar-selected">{selected ? formatDate(selected) : '日付を選んでください'}</p>

        <div className="dialog-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" disabled={!selected} onClick={() => onDone(selected)}>
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
