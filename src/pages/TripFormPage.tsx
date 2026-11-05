import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { createTrip, updateTrip } from '../lib/trips'
import { useTrip } from '../lib/useTrip'
import { countDays } from '../lib/date'
import { BackIcon } from '../components/Icons'
import { CharacterBubble } from '../components/Character'
import type { TripInput } from '../types'

const EMPTY: TripInput = { title: '', destination: '', startDate: '', endDate: '', memo: '' }
const MAX_DAYS = 31

// 新規作成（/trips/new）と編集（/trips/:tripId/edit）の両方で使う
export function TripFormPage() {
  const { tripId } = useParams()
  const tripState = useTrip(tripId)

  if (!tripId) return <TripForm initial={EMPTY} />
  if (tripState.status === 'loading') return <main className="page muted">読み込み中…</main>
  if (tripState.status !== 'ready') return <NotFound />

  const { title, destination, startDate, endDate, memo } = tripState.trip
  return <TripForm tripId={tripId} initial={{ title, destination, startDate, endDate, memo }} />
}

function TripForm({ tripId, initial }: { tripId?: string; initial: TripInput }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<TripInput>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const backTo = tripId ? `/trips/${tripId}` : '/'

  const set = (key: keyof TripInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (form.endDate < form.startDate) {
      setError('終了日は開始日以降にしてください。')
      return
    }
    if (countDays(form.startDate, form.endDate) > MAX_DAYS) {
      setError(`日程は${MAX_DAYS}日以内にしてください。`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const input = { ...form, title: form.title.trim(), destination: form.destination.trim() }
      const id = tripId ?? (await createTrip(user, input))
      if (tripId) await updateTrip(tripId, input)
      navigate(`/trips/${id}`, { replace: true })
    } catch (err) {
      console.error(err)
      setError('保存できませんでした。もう一度お試しください。')
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <header className="detail-header">
        <Link to={backTo} className="icon-button" aria-label="戻る">
          <BackIcon />
        </Link>
        <div className="detail-title">
          <h1>{tripId ? '旅の情報を編集' : '新しい旅をつくる'}</h1>
        </div>
        <span className="icon-button" />
      </header>

      <CharacterBubble
        character="keroro"
        size={80}
        text={tripId ? '作戦を変更するであります！' : '新しい旅の作戦開始であります！'}
      />

      <form className="form" onSubmit={handleSubmit}>
        <label>
          旅行の名前
          <input required value={form.title} onChange={set('title')} placeholder="例：新潟旅行" />
        </label>
        <label>
          行き先
          <input value={form.destination} onChange={set('destination')} placeholder="例：新潟" />
        </label>
        <div className="row">
          <label>
            出発日
            <input type="date" required value={form.startDate} onChange={set('startDate')} />
          </label>
          <label>
            帰着日
            <input type="date" required value={form.endDate} onChange={set('endDate')} />
          </label>
        </div>
        <label>
          メモ
          <textarea rows={3} value={form.memo} onChange={set('memo')} />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary-large" disabled={saving}>
          {saving ? '保存中…' : tripId ? '保存' : 'しおりを作成'}
        </button>
      </form>
    </main>
  )
}

export function NotFound() {
  return (
    <main className="page">
      <p>見つかりません。削除されたか、メンバーに入っていない可能性があります。</p>
      <Link to="/">旅の一覧へ戻る</Link>
    </main>
  )
}
