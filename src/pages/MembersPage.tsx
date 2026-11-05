import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTrip } from '../lib/useTrip'
import { NotFound } from './TripFormPage'
import { MembersSection } from '../components/MembersSection'
import { BackIcon } from '../components/Icons'

export function MembersPage() {
  const { tripId } = useParams()
  const tripState = useTrip(tripId)
  const { user } = useAuth()

  if (tripState.status === 'loading') return <main className="page muted">読み込み中…</main>
  if (tripState.status !== 'ready') return <NotFound />
  const { trip } = tripState

  return (
    <main className="page">
      <header className="detail-header">
        <Link to={`/trips/${trip.id}`} className="icon-button" aria-label="戻る">
          <BackIcon />
        </Link>
        <div className="detail-title">
          <h1>メンバー</h1>
          <p className="muted small-text">{trip.title}</p>
        </div>
        <span className="icon-button" />
      </header>
      <MembersSection trip={trip} isOwner={trip.ownerUid === user?.uid} />
    </main>
  )
}
