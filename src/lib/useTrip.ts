import { useEffect, useState } from 'react'
import { subscribeTrip } from './trips'
import type { Trip } from '../types'

type State =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; trip: Trip }

// しおり1件をリアルタイムで受け取る。メンバーでない場合はルールで弾かれ notFound 扱いにする
export function useTrip(tripId: string | undefined): State {
  // どのしおりの結果かを一緒に持ち、別のしおりに切り替わった直後は loading を返す
  const [result, setResult] = useState<{ tripId: string; state: State } | null>(null)

  useEffect(() => {
    if (!tripId) return
    return subscribeTrip(
      tripId,
      (trip) =>
        setResult({ tripId, state: trip ? { status: 'ready', trip } : { status: 'notFound' } }),
      (e) => {
        console.error(e)
        const notFound = (e as { code?: string }).code === 'permission-denied'
        setResult({ tripId, state: { status: notFound ? 'notFound' : 'error' } })
      },
    )
  }, [tripId])

  if (!tripId) return { status: 'notFound' }
  if (result?.tripId !== tripId) return { status: 'loading' }
  return result.state
}
