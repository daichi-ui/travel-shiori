import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { createTrip, updateTrip } from '../lib/trips'
import { useTrip } from '../lib/useTrip'
import type { TripInput } from '../types'

const EMPTY: TripInput = { title: '', destination: '', startDate: '', endDate: '', memo: '' }

// 新規作成（/trips/new）と編集（/trips/:tripId/edit）の両方で使う
export function TripFormPage() {
  const { tripId } = useParams()
  const tripState = useTrip(tripId)

  if (!tripId) return <TripForm initial={EMPTY} />
  if (tripState.status === 'loading') return <main>読み込み中…</main>
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

  const set = (key: keyof TripInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (form.endDate < form.startDate) {
      setError('終了日は開始日以降にしてください。')
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
    <main>
      <h1>{tripId ? 'しおりを編集' : '新しいしおり'}</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          タイトル
          <input required value={form.title} onChange={set('title')} placeholder="例：京都旅行" />
        </label>
        <label>
          目的地
          <input value={form.destination} onChange={set('destination')} placeholder="例：京都" />
        </label>
        <div className="row">
          <label>
            開始日
            <input type="date" required value={form.startDate} onChange={set('startDate')} />
          </label>
          <label>
            終了日
            <input type="date" required value={form.endDate} onChange={set('endDate')} />
          </label>
        </div>
        <label>
          メモ
          <textarea rows={4} value={form.memo} onChange={set('memo')} />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <Link to={tripId ? `/trips/${tripId}` : '/'} className="button secondary">
            キャンセル
          </Link>
          <button type="submit" disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </form>
    </main>
  )
}

export function NotFound() {
  return (
    <main>
      <p>しおりが見つかりません。削除されたか、メンバーに入っていない可能性があります。</p>
      <Link to="/">しおり一覧へ戻る</Link>
    </main>
  )
}
