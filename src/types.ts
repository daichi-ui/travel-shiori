import type { Timestamp } from 'firebase/firestore'

export type Trip = {
  id: string
  title: string
  destination: string
  startDate: string // "2026-12-01"
  endDate: string
  memo: string
  ownerUid: string
  ownerEmail: string
  memberEmails: string[] // 作成者を含む
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

// フォームで入力する項目
export type TripInput = Pick<Trip, 'title' | 'destination' | 'startDate' | 'endDate' | 'memo'>

export const CATEGORIES = {
  move: '移動',
  food: '食事',
  sightseeing: '観光',
  hotel: '宿泊',
  other: 'その他',
} as const
export type Category = keyof typeof CATEGORIES

export const RESERVATIONS = {
  none: '予約なし',
  todo: 'これから予約',
  done: '予約済',
} as const
export type Reservation = keyof typeof RESERVATIONS

// trips/{tripId}/schedules/{scheduleId}
export type Schedule = {
  id: string
  date: string // "2026-12-01"
  startTime: string // "09:30"、未定なら ""
  endTime: string
  title: string
  category: Category
  reservation: Reservation
  place: string
  memo: string
  createdAt: Timestamp | null
}

export type ScheduleInput = Omit<Schedule, 'id' | 'createdAt'>

// users/{uid}/packingItems/{itemId}（本人だけが見られる）
export type PackingItem = {
  id: string
  name: string
  checked: boolean
  createdAt: Timestamp | null
}
