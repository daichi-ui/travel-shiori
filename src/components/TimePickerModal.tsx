import { useState } from 'react'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

const pad = (n: number) => String(n).padStart(2, '0')

// "9:5" "0930" "930" などを "09:30" にそろえる。読めなければ null
function normalizeTime(value: string): string | null {
  const text = value.trim()
  if (!text) return ''
  const match = text.includes(':')
    ? text.match(/^(\d{1,2}):(\d{1,2})$/)
    : text.match(/^(\d{1,2})(\d{2})$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return `${pad(h)}:${pad(m)}`
}

function parts(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{1,2})$/)
  return match ? { h: Number(match[1]), m: Number(match[2]) } : null
}

export function TimePickerModal({
  title,
  value,
  onDone,
  onCancel,
}: {
  title: string
  value: string // "09:30"、未定なら ""
  onDone: (value: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const current = parts(draft)

  // 時間・分のボタンを押すと、手入力欄のその部分だけ書き換える
  const setHour = (h: number) => {
    setDraft(`${pad(h)}:${pad(current?.m ?? 0)}`)
    setError(null)
  }
  const setMinute = (m: number) => {
    setDraft(`${pad(current?.h ?? 0)}:${pad(m)}`)
    setError(null)
  }

  const handleDone = () => {
    const normalized = normalizeTime(draft)
    if (normalized === null) {
      setError('「09:30」のように入力してください。')
      return
    }
    onDone(normalized)
  }

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog time-picker"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>

        <input
          className="time-input"
          inputMode="numeric"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(null)
          }}
          aria-label={`${title}（手入力）`}
        />
        {error && <p className="error small-text">{error}</p>}

        <div>
          <p className="picker-label">時</p>
          <div className="picker-grid">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                className={current?.h === h ? 'picker-option active' : 'picker-option'}
                onClick={() => setHour(h)}
              >
                {h}時
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="picker-label">分</p>
          <div className="picker-grid">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                className={current?.m === m ? 'picker-option active' : 'picker-option'}
                onClick={() => setMinute(m)}
              >
                {pad(m)}分
              </button>
            ))}
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" className="text-button" onClick={() => onDone('')}>
            未定にする
          </button>
          <span className="spacer" />
          <button type="button" className="secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" onClick={handleDone}>
            決定
          </button>
        </div>
      </div>
    </div>
  )
}
