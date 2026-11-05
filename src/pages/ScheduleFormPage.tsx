import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTrip } from '../lib/useTrip'
import { useSchedules } from '../lib/useSchedules'
import { createSchedule, deleteSchedule, updateSchedule } from '../lib/schedules'
import { formatShortDate, listDays } from '../lib/date'
import { NotFound } from './TripFormPage'
import { BackIcon, CategoryIcon } from '../components/Icons'
import {
  CATEGORIES,
  RESERVATIONS,
  type Category,
  type Reservation,
  type ScheduleInput,
  type Trip,
} from '../types'

// 予定の追加（/trips/:tripId/schedules/new?date=...）と編集（/trips/:tripId/schedules/:scheduleId）
export function ScheduleFormPage() {
  const { tripId, scheduleId } = useParams()
  const [searchParams] = useSearchParams()
  const tripState = useTrip(tripId)
  const schedules = useSchedules(tripId)

  if (tripState.status === 'loading' || (scheduleId && schedules === null)) {
    return <main className="page muted">読み込み中…</main>
  }
  if (tripState.status !== 'ready') return <NotFound />
  const { trip } = tripState

  if (!scheduleId) {
    const days = listDays(trip.startDate, trip.endDate)
    const date = searchParams.get('date') ?? ''
    const initial: ScheduleInput = {
      date: days.includes(date) ? date : days[0],
      startTime: '',
      endTime: '',
      title: '',
      category: 'sightseeing',
      reservation: 'none',
      place: '',
      memo: '',
    }
    return <ScheduleForm trip={trip} initial={initial} />
  }

  const schedule = schedules?.find((s) => s.id === scheduleId)
  if (!schedule) return <NotFound />
  const { id: _id, createdAt: _createdAt, ...initial } = schedule
  return <ScheduleForm trip={trip} scheduleId={scheduleId} initial={initial} />
}

function ScheduleForm({
  trip,
  scheduleId,
  initial,
}: {
  trip: Trip
  scheduleId?: string
  initial: ScheduleInput
}) {
  const navigate = useNavigate()
  const [form, setForm] = useState<ScheduleInput>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const backTo = `/trips/${trip.id}?day=${initial.date}`

  // 期間外になった予定の日付も選べるようにしておく
  const days = [...new Set([...listDays(trip.startDate, trip.endDate), initial.date])].sort()

  const set =
    (key: keyof ScheduleInput) => (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.startTime && form.endTime && form.endTime < form.startTime) {
      setError('終了時刻は開始時刻より後にしてください。')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const input = { ...form, title: form.title.trim(), place: form.place.trim() }
      if (scheduleId) await updateSchedule(trip.id, scheduleId, input)
      else await createSchedule(trip.id, input)
      navigate(`/trips/${trip.id}?day=${form.date}`, { replace: true })
    } catch (err) {
      console.error(err)
      setError('保存できませんでした。もう一度お試しください。')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!scheduleId || !confirm(`「${initial.title}」を削除します。よろしいですか？`)) return
    try {
      navigate(backTo, { replace: true })
      await deleteSchedule(trip.id, scheduleId)
    } catch (err) {
      console.error(err)
      alert('削除できませんでした。もう一度お試しください。')
    }
  }

  return (
    <main className="page">
      <header className="detail-header">
        <Link to={backTo} className="icon-button" aria-label="戻る">
          <BackIcon />
        </Link>
        <div className="detail-title">
          <h1>{scheduleId ? '予定を編集' : '予定を追加'}</h1>
          <p className="muted small-text">{trip.title}</p>
        </div>
        <span className="icon-button" />
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <fieldset className="chips">
          <legend>種類</legend>
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <label key={c} className={form.category === c ? 'chip active' : 'chip'}>
              <input
                type="radio"
                name="category"
                value={c}
                checked={form.category === c}
                onChange={() => setForm((f) => ({ ...f, category: c }))}
              />
              <CategoryIcon category={c} />
              {CATEGORIES[c]}
            </label>
          ))}
        </fieldset>

        <label>
          予定の名前
          <input required value={form.title} onChange={set('title')} placeholder="例：ホテルにチェックイン" />
        </label>

        <label>
          日付
          <select value={form.date} onChange={set('date')}>
            {days.map((day, i) => (
              <option key={day} value={day}>
                {i + 1}日目 {formatShortDate(day)}
              </option>
            ))}
          </select>
        </label>

        <div className="row">
          <label>
            開始時刻
            <input type="time" value={form.startTime} onChange={set('startTime')} />
          </label>
          <label>
            終了時刻
            <input type="time" value={form.endTime} onChange={set('endTime')} />
          </label>
        </div>

        <label>
          場所
          <input value={form.place} onChange={set('place')} placeholder="例：新潟駅" />
        </label>

        <fieldset className="chips">
          <legend>予約</legend>
          {(Object.keys(RESERVATIONS) as Reservation[]).map((r) => (
            <label key={r} className={form.reservation === r ? 'chip active' : 'chip'}>
              <input
                type="radio"
                name="reservation"
                value={r}
                checked={form.reservation === r}
                onChange={() => setForm((f) => ({ ...f, reservation: r }))}
              />
              {RESERVATIONS[r]}
            </label>
          ))}
        </fieldset>

        <label>
          メモ
          <textarea rows={3} value={form.memo} onChange={set('memo')} />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary-large" disabled={saving}>
          {saving ? '保存中…' : '保存'}
        </button>
        {scheduleId && (
          <button type="button" className="danger-text" onClick={handleDelete}>
            この予定を削除
          </button>
        )}
      </form>
    </main>
  )
}
