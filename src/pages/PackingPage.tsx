import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  addPackingItem,
  deletePackingItem,
  setPackingChecked,
  subscribePacking,
} from '../lib/packing'
import { TrashIcon } from '../components/Icons'
import { CharacterBubble } from '../components/Character'
import type { PackingItem } from '../types'

// 自分だけの持ち物リスト（旅行に関係なく1つ）
export function PackingPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<PackingItem[] | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const uid = user?.uid

  useEffect(() => {
    if (!uid) return
    return subscribePacking(uid, setItems, (e) => {
      console.error(e)
      setError('持ち物を読み込めませんでした。')
    })
  }, [uid])

  const run = async (action: () => Promise<void>) => {
    setError(null)
    try {
      await action()
    } catch (e) {
      console.error(e)
      setError('保存できませんでした。もう一度お試しください。')
    }
  }

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const value = name.trim()
    if (!uid || !value) return
    setName('')
    run(() => addPackingItem(uid, value))
  }

  const done = items?.filter((i) => i.checked).length ?? 0

  return (
    <main className="page">
      <header className="brand-header">
        <div>
          <h1 className="page-title">持ち物</h1>
          <p className="muted small-text">あなただけのリストです（ほかの人には見えません）</p>
        </div>
      </header>

      <CharacterBubble
        character="giroro"
        reverse
        size={76}
        text={
          !items?.length
            ? '装備の確認は基本中の基本だ！持っていくものを追加しろ！'
            : done === items.length
              ? '装備は万全だな。よし、出撃だ！'
              : `あと${items.length - done}個…装備の確認を怠るな！`
        }
      />

      <form className="inline-form" onSubmit={handleAdd}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：充電器" />
        <button type="submit" disabled={!name.trim()}>
          追加
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {items === null && !error && <p className="muted">読み込み中…</p>}
      {!!items?.length && (
        <p className="muted small-text">
          {done} / {items.length} 個 準備OK
        </p>
      )}

      <ul className="packing-list">
        {items?.map((item) => (
          <li key={item.id} className={item.checked ? 'checked' : ''}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => uid && run(() => setPackingChecked(uid, item.id, e.target.checked))}
              />
              <span>{item.name}</span>
            </label>
            <button
              className="icon-button"
              aria-label={`${item.name}を削除`}
              onClick={() => uid && run(() => deletePackingItem(uid, item.id))}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
