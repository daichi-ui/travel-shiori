import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import type { Trip, TripInput } from '../types'

const tripsCol = collection(db, 'trips')

// しおりの中にあるサブコレクション（しおり削除時に一緒に消す）
const SUB_COLLECTIONS = ['schedules', 'packingItems']

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function toTrip(snap: DocumentSnapshot): Trip {
  return { id: snap.id, ...(snap.data() as Omit<Trip, 'id'>) }
}

// 自分がメンバーになっているしおりを、開始日が近い順でリアルタイムに受け取る
export function subscribeMyTrips(
  email: string,
  onChange: (trips: Trip[]) => void,
  onError: (e: Error) => void,
) {
  const q = query(tripsCol, where('memberEmails', 'array-contains', normalizeEmail(email)))
  return onSnapshot(
    q,
    (snap) => {
      const trips = snap.docs.map(toTrip)
      trips.sort((a, b) => a.startDate.localeCompare(b.startDate))
      onChange(trips)
    },
    onError,
  )
}

export function subscribeTrip(
  tripId: string,
  onChange: (trip: Trip | null) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(
    doc(tripsCol, tripId),
    (snap) => onChange(snap.exists() ? toTrip(snap) : null),
    onError,
  )
}

export async function createTrip(user: User, input: TripInput) {
  const email = normalizeEmail(user.email ?? '')
  const ref = await addDoc(tripsCol, {
    ...input,
    ownerUid: user.uid,
    ownerEmail: email,
    memberEmails: [email],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTrip(tripId: string, input: TripInput) {
  await updateDoc(doc(tripsCol, tripId), { ...input, updatedAt: serverTimestamp() })
}

// メンバー機能より前に作ったしおりには ownerEmail が無いので、作成者が開いたときに補う
export async function backfillOwnerEmail(trip: Trip, user: User) {
  if (trip.ownerEmail || trip.ownerUid !== user.uid || !user.email) return
  await updateDoc(doc(tripsCol, trip.id), { ownerEmail: normalizeEmail(user.email) })
}

// メンバーの追加・削除は作成者だけができる（ルールで制限）
export async function addMember(tripId: string, email: string) {
  await updateDoc(doc(tripsCol, tripId), {
    memberEmails: arrayUnion(normalizeEmail(email)),
    updatedAt: serverTimestamp(),
  })
}

export async function removeMember(tripId: string, email: string) {
  await updateDoc(doc(tripsCol, tripId), {
    memberEmails: arrayRemove(email),
    updatedAt: serverTimestamp(),
  })
}

// サブコレクションを先に消してから、しおり本体を消す
// （本体を先に消すと、ルールでメンバー判定ができずサブコレクションを消せなくなる）
export async function deleteTrip(tripId: string) {
  for (const name of SUB_COLLECTIONS) {
    const snap = await getDocs(collection(db, 'trips', tripId, name))
    // 1回のバッチは500件まで
    for (let i = 0; i < snap.docs.length; i += 500) {
      const batch = writeBatch(db)
      snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
  }
  const batch = writeBatch(db)
  batch.delete(doc(tripsCol, tripId))
  await batch.commit()
}
