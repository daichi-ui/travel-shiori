import { useEffect, useRef, useState, type PointerEvent } from 'react'

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
  // 「1445」のような手入力もボタンの選択状態に反映する
  const current = parts(normalizeTime(draft) ?? '')

  // 分のボタンを押すと、手入力欄の分だけ書き換える（時が未入力なら矢印と同じ9時から）
  const setMinute = (m: number) => {
    setDraft(`${pad(current?.h ?? 9)}:${pad(m)}`)
    setError(null)
  }

  // 矢印ボタンで1時間ずつ増減する（23時の次は0時）。長押しで連続して動く
  const stepHour = (delta: 1 | -1) => {
    setDraft((d) => {
      const p = parts(normalizeTime(d) ?? '')
      const h = p ? (p.h + delta + 24) % 24 : 9
      return `${pad(h)}:${pad(p?.m ?? 0)}`
    })
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
          <HourStepper hour={current?.h ?? null} onStep={stepHour} />
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

function hourLabel(h: number) {
  if (h < 12) return `午前${h}時`
  return h === 12 ? '正午' : `午後${h - 12}時`
}

// 「‹ 13時 ›」の形で1時間ずつ動かす。数字は押した向きにスライドする
function HourStepper({ hour, onStep }: { hour: number | null; onStep: (delta: 1 | -1) => void }) {
  const [direction, setDirection] = useState<1 | -1>(1)
  const timers = useRef<{ delay?: number; repeat?: number }>({})

  const stop = () => {
    window.clearTimeout(timers.current.delay)
    window.clearInterval(timers.current.repeat)
    timers.current = {}
  }
  useEffect(() => stop, [])

  const step = (delta: 1 | -1) => {
    setDirection(delta)
    onStep(delta)
  }

  const start = (delta: 1 | -1) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault() // 長押しで文字選択やメニューが出ないようにする
    stop()
    step(delta)
    timers.current.delay = window.setTimeout(() => {
      timers.current.repeat = window.setInterval(() => step(delta), 120)
    }, 400)
  }

  const arrow = (delta: 1 | -1) => (
    <button
      type="button"
      className="step-button"
      aria-label={delta === 1 ? '1時間進める' : '1時間戻す'}
      onPointerDown={start(delta)}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      // キーボード操作（Enter / スペース）のときだけ click で動かす
      onClick={(e) => e.detail === 0 && step(delta)}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={delta === 1 ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
      </svg>
    </button>
  )

  return (
    <div className="hour-stepper">
      {arrow(-1)}
      <div className="hour-display" aria-live="polite">
        <span key={hour ?? 'none'} className={`hour-value ${direction === 1 ? 'slide-next' : 'slide-prev'}`}>
          <span className="hour-number">{hour === null ? '--' : hour}</span>
          <span className="hour-unit">時</span>
        </span>
        <span className="hour-sub">{hour === null ? '矢印で選べます' : hourLabel(hour)}</span>
      </div>
      {arrow(1)}
    </div>
  )
}
