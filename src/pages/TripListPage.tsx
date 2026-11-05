import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { subscribeMyTrips } from '../lib/trips'
import { useSchedules } from '../lib/useSchedules'
import { countDays, formatPeriod } from '../lib/date'
import { PlusIcon } from '../components/Icons'
import { CharacterBubble } from '../components/Character'
import type { Trip } from '../types'

export function TripListPage() {
  const { user, logout } = useAuth()
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user?.email) return
    return subscribeMyTrips(user.email, setTrips, (e) => {
      console.error(e)
      setError(true)
    })
  }, [user?.email])

  return (
    <main className="page">
      <header className="brand-header">
        <div>
          <p className="brand">旅のしおり</p>
          <p className="muted small-text">みんなでつくる旅の予定</p>
        </div>
        <button className="text-button" onClick={logout}>
          ログアウト
        </button>
      </header>

      <CharacterBubble
        character="keroro"
        text={
          trips?.length === 0
            ? 'まだ旅がないであります！さっそく作戦を立てるであります！'
            : '次の旅の作戦会議であります！'
        }
      />

      <h2 className="section-title">あなたの旅</h2>
      <Link to="/trips/new" className="button primary-large">
        <PlusIcon /> 新しい旅をつくる
      </Link>

      {error && <p className="error">旅を読み込めませんでした。</p>}
      {!error && trips === null && <p className="muted">読み込み中…</p>}

      <ul className="trip-list">
        {trips?.map((trip) => (
          <li key={trip.id}>
            <TripCard trip={trip} />
          </li>
        ))}
      </ul>
    </main>
  )
}

function TripCard({ trip }: { trip: Trip }) {
  const schedules = useSchedules(trip.id)

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      <div className="trip-thumb" aria-hidden="true" />
      <div className="trip-card-body">
        <strong className="trip-card-title">{trip.title}</strong>
        <span className="muted small-text">{formatPeriod(trip.startDate, trip.endDate)}</span>
        {trip.destination && <span className="small-text">{trip.destination}</span>}
        <span className="muted small-text">
          {`${countDays(trip.startDate, trip.endDate)}日間　予定${schedules?.length ?? '-'}件　${trip.memberEmails.length}人で共有`}
        </span>
      </div>
    </Link>
  )
}
