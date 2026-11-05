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
