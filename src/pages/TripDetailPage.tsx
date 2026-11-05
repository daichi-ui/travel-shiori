import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { backfillOwnerEmail, deleteTrip } from '../lib/trips'
import { useTrip } from '../lib/useTrip'
import { formatPeriod } from '../lib/date'
import { NotFound } from './TripFormPage'
import { MembersSection } from '../components/MembersSection'

export function TripDetailPage() {
  const { tripId } = useParams()
  const tripState = useTrip(tripId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const trip = tripState.status === 'ready' ? tripState.trip : null

  useEffect(() => {
    if (trip && user) backfillOwnerEmail(trip, user).catch(console.error)
  }, [trip, user])

  if (tripState.status === 'loading') return <main>読み込み中…</main>
  if (tripState.status === 'error') return <main className="error">読み込めませんでした。</main>
  if (!trip) return <NotFound />

  const isOwner = trip.ownerUid === user?.uid

  const handleDelete = async () => {
    if (!confirm(`「${trip.title}」を削除します。日程や持ち物もすべて消えます。よろしいですか？`)) return
    setDeleting(true)
    try {
      // 先に一覧へ戻り、削除中にこの画面が「見つかりません」に切り替わるのを避ける
      navigate('/', { replace: true })
      await deleteTrip(trip.id)
    } catch (e) {
      console.error(e)
      alert('削除できませんでした。もう一度お試しください。')
      setDeleting(false)
    }
  }

  return (
    <main>
      <Link to="/">← しおり一覧</Link>
      <h1>{trip.title}</h1>
      <p>
        {trip.destination && <>{trip.destination}・</>}
        {formatPeriod(trip.startDate, trip.endDate)}
      </p>
      {trip.memo && <p className="memo">{trip.memo}</p>}

      <div className="actions">
        <Link to={`/trips/${trip.id}/edit`} className="button secondary">
          編集
        </Link>
        {isOwner && (
          <button className="danger" onClick={handleDelete} disabled={deleting}>
            削除
          </button>
        )}
      </div>

      <MembersSection trip={trip} isOwner={isOwner} />

      <section>
        <h2>日程表</h2>
        <p className="muted">これから作ります。</p>
      </section>
      <section>
        <h2>持ち物</h2>
        <p className="muted">これから作ります。</p>
      </section>
    </main>
  )
}
