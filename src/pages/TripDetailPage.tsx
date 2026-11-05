import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { backfillOwnerEmail, deleteTrip } from '../lib/trips'
import { useTrip } from '../lib/useTrip'
import { useSchedules } from '../lib/useSchedules'
import { formatPeriod, formatShortDate, listDays } from '../lib/date'
import { NotFound } from './TripFormPage'
import {
  BackIcon,
  CategoryIcon,
  ChevronIcon,
  LinkIcon,
  MoreIcon,
  PlusIcon,
  UsersIcon,
} from '../components/Icons'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { shortLink, toLink } from '../lib/url'
import { RESERVATIONS, type Schedule } from '../types'

export function TripDetailPage() {
  const { tripId } = useParams()
  const tripState = useTrip(tripId)
  const schedules = useSchedules(tripId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const trip = tripState.status === 'ready' ? tripState.trip : null

  useEffect(() => {
    if (trip && user) backfillOwnerEmail(trip, user).catch(console.error)
  }, [trip, user])

  if (tripState.status === 'loading') return <main className="page muted">読み込み中…</main>
  if (tripState.status === 'error') return <main className="page error">読み込めませんでした。</main>
  if (!trip) return <NotFound />

  const isOwner = trip.ownerUid === user?.uid

  // 旅行期間の日付に加え、期間を変えたあとに範囲外になった予定の日付も出す
  const days = [...new Set([...listDays(trip.startDate, trip.endDate), ...(schedules ?? []).map((s) => s.date)])].sort()
  const dayParam = searchParams.get('day')
  const selectedDay = dayParam && days.includes(dayParam) ? dayParam : days[0]
  const daySchedules = (schedules ?? []).filter((s) => s.date === selectedDay)

  const handleDelete = async () => {
    setConfirming(false)
    try {
      // 先に一覧へ戻り、削除中にこの画面が「見つかりません」に切り替わるのを避ける
      navigate('/', { replace: true })
      await deleteTrip(trip.id)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="page has-fab">
      <header className="detail-header">
        <Link to="/" className="icon-button" aria-label="旅の一覧へ戻る">
          <BackIcon />
        </Link>
        <div className="detail-title">
          <h1>{trip.title}</h1>
          <p className="muted small-text">{formatPeriod(trip.startDate, trip.endDate)}</p>
        </div>
        <div className="menu-wrap">
          <button className="icon-button" aria-label="メニュー" onClick={() => setMenuOpen((o) => !o)}>
            <MoreIcon />
          </button>
          {menuOpen && (
            <div className="menu" onClick={() => setMenuOpen(false)}>
              <Link to={`/trips/${trip.id}/edit`}>旅の情報を編集</Link>
              <Link to={`/trips/${trip.id}/members`}>メンバー</Link>
              {isOwner && (
                <button className="danger-text" onClick={() => setConfirming(true)}>
                  旅を削除
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="day-tabs" role="tablist">
        {days.map((day, i) => (
          <button
            key={day}
            role="tab"
            aria-selected={day === selectedDay}
            className={day === selectedDay ? 'day-tab active' : 'day-tab'}
            onClick={() => setSearchParams({ day }, { replace: true })}
          >
            {i + 1}日目 {formatShortDate(day)}
          </button>
        ))}
      </div>

      <Link to={`/trips/${trip.id}/members`} className="share-banner">
        <UsersIcon />
        <span>
          <strong>{trip.memberEmails.length}人で共有中</strong>
          <br />
          <span className="muted small-text">あなた：{isOwner ? 'オーナー' : 'メンバー'}</span>
        </span>
        <ChevronIcon />
      </Link>

      {schedules === null && <p className="muted">読み込み中…</p>}
      {schedules !== null && daySchedules.length === 0 && (
        <p className="muted empty">この日の予定はまだありません。</p>
      )}

      <ol className="timeline">
        {daySchedules.map((s) => (
          <li key={s.id}>
            <ScheduleRow tripId={trip.id} schedule={s} />
          </li>
        ))}
      </ol>

      <Link to={`/trips/${trip.id}/schedules/new?date=${selectedDay}`} className="fab">
        <PlusIcon /> 予定を追加
      </Link>

      {confirming && (
        <ConfirmDialog
          message={`「${trip.title}」を削除します。予定もすべて消えます。よろしいですか？`}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </main>
  )
}

function ScheduleRow({ tripId, schedule: s }: { tripId: string; schedule: Schedule }) {
  const link = s.url ? toLink(s.url) : null
  return (
    <>
      <div className="timeline-time">
        <strong>{s.startTime || '--:--'}</strong>
        {s.endTime && <span className="muted">〜{s.endTime}</span>}
      </div>
      {/* カード全体は編集画面へのリンク。URL だけは上に重ねて別タブで開く（リンクの入れ子を避ける） */}
      <div className="schedule-card">
        <span className={`category-icon category-${s.category}`}>
          <CategoryIcon category={s.category} />
        </span>
        <span className="schedule-body">
          <Link to={`/trips/${tripId}/schedules/${s.id}`} className="stretched-link">
            <strong>{s.title}</strong>
          </Link>
          {s.place && <span className="muted small-text">{s.place}</span>}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="url-link small">
              <LinkIcon />
              <span>{shortLink(link)}</span>
            </a>
          )}
          {s.reservation !== 'none' && (
            <span className={`reservation reservation-${s.reservation}`}>
              {RESERVATIONS[s.reservation]}
            </span>
          )}
        </span>
        <ChevronIcon />
      </div>
    </>
  )
}
