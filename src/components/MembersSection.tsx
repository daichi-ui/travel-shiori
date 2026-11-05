import { useState, type FormEvent } from 'react'
import { addMember, normalizeEmail, removeMember } from '../lib/trips'
import type { Trip } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function MembersSection({ trip, isOwner }: { trip: Trip; isOwner: boolean }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    const value = normalizeEmail(email)
    if (!EMAIL_PATTERN.test(value)) {
      setError('メールアドレスの形式が正しくありません。')
      return
    }
    if (trip.memberEmails.includes(value)) {
      setError('すでにメンバーです。')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await addMember(trip.id, value)
      setEmail('')
    } catch (err) {
      console.error(err)
      setError('追加できませんでした。もう一度お試しください。')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (member: string) => {
    if (!confirm(`${member} をメンバーから外します。よろしいですか？`)) return
    setBusy(true)
    setError(null)
    try {
      await removeMember(trip.id, member)
    } catch (err) {
      console.error(err)
      setError('外せませんでした。もう一度お試しください。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <h2>メンバー</h2>
      <ul className="member-list">
        {trip.memberEmails.map((member) => (
          <li key={member}>
            <span>
              {member}
              {member === trip.ownerEmail && <span className="badge">作成者</span>}
            </span>
            {isOwner && member !== trip.ownerEmail && (
              <button className="secondary small" onClick={() => handleRemove(member)} disabled={busy}>
                外す
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form className="inline-form" onSubmit={handleAdd}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="友だちのGoogleアカウント（Gmail）"
            required
          />
          <button type="submit" disabled={busy}>
            追加
          </button>
        </form>
      )}
      {isOwner && (
        <p className="muted small-text">
          追加した人がそのGoogleアカウントでログインすると、一覧にこのしおりが表示されます。
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
