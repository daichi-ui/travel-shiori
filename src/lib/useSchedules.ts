import { useEffect, useState } from 'react'
import { subscribeSchedules } from './schedules'
import type { Schedule } from '../types'

// しおりの予定をリアルタイムで受け取る。読み込み中は null
export function useSchedules(tripId: string | undefined) {
  const [result, setResult] = useState<{ tripId: string; schedules: Schedule[] } | null>(null)

  useEffect(() => {
    if (!tripId) return
    return subscribeSchedules(
      tripId,
      (schedules) => setResult({ tripId, schedules }),
      (e) => console.error(e),
    )
  }, [tripId])

  return result && result.tripId === tripId ? result.schedules : null
}
