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
import type { PackingItem } from '../types'

// 持ち物は旅行に関係なく、Googleアカウントごとに1つのリスト
const packingCol = (uid: string) => collection(db, 'users', uid, 'packingItems')

export function subscribePacking(
  uid: string,
  onChange: (items: PackingItem[]) => void,
  onError: (e: Error) => void,
) {
  return onSnapshot(
    packingCol(uid),
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PackingItem)
      items.sort(
        (a, b) => (a.createdAt?.toMillis() ?? Infinity) - (b.createdAt?.toMillis() ?? Infinity),
      )
      onChange(items)
    },
    onError,
  )
}

export async function addPackingItem(uid: string, name: string) {
  await addDoc(packingCol(uid), { name, checked: false, createdAt: serverTimestamp() })
}

export async function setPackingChecked(uid: string, itemId: string, checked: boolean) {
  await updateDoc(doc(packingCol(uid), itemId), { checked })
}

export async function deletePackingItem(uid: string, itemId: string) {
  await deleteDoc(doc(packingCol(uid), itemId))
}
