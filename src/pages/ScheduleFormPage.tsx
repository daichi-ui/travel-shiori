import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTrip } from '../lib/useTrip'
import { useSchedules } from '../lib/useSchedules'
import { createSchedule, deleteSchedule, updateSchedule } from '../lib/schedules'
import { formatShortDate, listDays } from '../lib/date'
import { NotFound } from './TripFormPage'
import { BackIcon, CategoryIcon } from '../components/Icons'
import { mapsDirectionsUrl, toLink } from '../lib/url'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { TimePickerModal } from '../components/TimePickerModal'
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
      address: '',
      url: '',
      memo: '',
    }
    return <ScheduleForm trip={trip} initial={initial} />
  }

  const schedule = schedules?.find((s) => s.id === scheduleId)
  if (!schedule) return <NotFound />
  const { id: _id, createdAt: _createdAt, ...rest } = schedule
  return <ScheduleForm trip={trip} scheduleId={scheduleId} initial={{ ...rest, url: rest.url ?? '', address: rest.address ?? '' }} />
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
  const [confirming, setConfirming] = useState(false)
  const [picking, setPicking] = useState<'startTime' | 'endTime' | null>(null)
  const link = toLink(form.url)
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
      const input = {
        ...form,
        title: form.title.trim(),
        place: form.place.trim(),
        address: form.address.trim(),
        // 「店名 https://...」のように貼られても、保存するのは URL 部分だけ
        url: toLink(form.url) ?? form.url.trim(),
      }
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
    if (!scheduleId) return
    // 削除するとこの画面は「見つかりません」になるので、先に旅程へ戻る
    navigate(backTo, { replace: true })
    try {
      await deleteSchedule(trip.id, scheduleId)
    } catch (err) {
      console.error(err)
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
          <input required value={form.title} onChange={set('title')} />
        </label>

        <fieldset className="chips">
          <legend>日付</legend>
          {days.map((day, i) => (
            <label key={day} className={form.date === day ? 'chip active' : 'chip'}>
              <input
                type="radio"
                name="date"
                value={day}
                checked={form.date === day}
                onChange={() => setForm((f) => ({ ...f, date: day }))}
              />
              {i + 1}日目 {formatShortDate(day)}
            </label>
          ))}
        </fieldset>

        <div className="time-fields">
          {(['startTime', 'endTime'] as const).map((key) => (
            <div key={key} className="time-field">
              {key === 'startTime' ? '開始時刻' : '終了時刻'}
              <button
                type="button"
                className={form[key] ? 'time-button' : 'time-button empty'}
                onClick={() => setPicking(key)}
              >
                {form[key] || '--:--'}
              </button>
            </div>
          ))}
        </div>

        <label>
          場所
          <input value={form.place} onChange={set('place')} />
        </label>

        {/* 「開く」で Google マップのナビ（現在地 → この住所）を起動する。
            iPhone はリンクを押したときだけアプリが入っていればアプリで開くので、ボタンではなくリンクにする */}
        <div className="time-field">
          <label htmlFor="schedule-address">住所</label>
          <div className="url-row">
            <input
              id="schedule-address"
              autoComplete="street-address"
              value={form.address}
              onChange={set('address')}
            />
            {form.address.trim() ? (
              <a
                className="button open-button"
                href={mapsDirectionsUrl(form.address)}
                target="_blank"
                rel="noopener noreferrer"
              >
                開く
              </a>
            ) : (
              <button type="button" className="open-button" disabled>
                開く
              </button>
            )}
          </div>
        </div>

        {/* 入力欄は普通に編集、右の「開く」で別タブに開く */}
        <div className="time-field">
          <label htmlFor="schedule-url">URL</label>
          <div className="url-row">
            <input
              id="schedule-url"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              value={form.url}
              onChange={set('url')}
            />
            <button
              type="button"
              className="open-button"
              disabled={!link}
              onClick={() => link && window.open(link, '_blank', 'noopener,noreferrer')}
            >
              開く
            </button>
          </div>
        </div>

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
          <button
            type="button"
            className="danger-text"
            onClick={() => setConfirming(true)}
            disabled={saving}
          >
            この予定を削除
          </button>
        )}
      </form>

      {picking && (
        <TimePickerModal
          title={picking === 'startTime' ? '開始時刻' : '終了時刻'}
          value={form[picking]}
          onDone={(value) => {
            setForm((f) => ({ ...f, [picking]: value }))
            setPicking(null)
            setError(null)
          }}
          onCancel={() => setPicking(null)}
        />
      )}

      {confirming && (
        <ConfirmDialog
          message={`「${initial.title}」を削除します。よろしいですか？`}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </main>
  )
}
