import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Schedule, ScheduleInput } from '../types'

const schedulesCol = (tripId: string) => collection(db, 'trips', tripId, 'schedules')

// 日付 → 開始時刻（未定は最後）→ 登録順 で並べる
function compareSchedules(a: Schedule, b: Schedule) {
  if (a.date !== b.date) return a.date.localeCompare(b.date)
  if (a.startTime !== b.startTime) {
    if (!a.startTime) return 1
    if (!b.startTime) return -1
    return a.startTime.localeCompare(b.startTime)
  }
  return (a.createdAt?.toMillis() ?? Infinity) - (b.createdAt?.toMillis() ?? Infinity)
}

export function subscribeSchedules(
  tripId: string,
  onChange: (schedules: Schedule[]) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(
    schedulesCol(tripId),
    (snap) => {
      const schedules = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Schedule)
      schedules.sort(compareSchedules)
      onChange(schedules)
    },
    onError,
  )
}

export async function createSchedule(tripId: string, input: ScheduleInput) {
  await addDoc(schedulesCol(tripId), { ...input, createdAt: serverTimestamp() })
}

export async function updateSchedule(tripId: string, scheduleId: string, input: ScheduleInput) {
  await updateDoc(doc(schedulesCol(tripId), scheduleId), input)
}

export async function deleteSchedule(tripId: string, scheduleId: string) {
  await deleteDoc(doc(schedulesCol(tripId), scheduleId))
}
