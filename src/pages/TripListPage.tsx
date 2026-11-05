import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { subscribeMyTrips } from '../lib/trips'
import { formatPeriod } from '../lib/date'
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
    <main>
      <header className="header">
        <h1>しおり一覧</h1>
        <button className="secondary" onClick={logout}>
          ログアウト
        </button>
      </header>

      <Link to="/trips/new" className="button">
        ＋ 新しいしおりを作る
      </Link>

      {error && <p className="error">しおりを読み込めませんでした。</p>}
      {!error && trips === null && <p>読み込み中…</p>}
      {trips?.length === 0 && <p>しおりはまだありません。</p>}

      <ul className="card-list">
        {trips?.map((trip) => (
          <li key={trip.id}>
            <Link to={`/trips/${trip.id}`} className="card">
              <strong>{trip.title}</strong>
              <span>{trip.destination}</span>
              <span className="muted">{formatPeriod(trip.startDate, trip.endDate)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
