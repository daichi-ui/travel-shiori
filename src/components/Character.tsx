import keroroImg from '../assets/characters/keroro.png'
import keroroTileImg from '../assets/characters/keroro-tile.png'
import pinkImg from '../assets/characters/pink.png'
import giroroImg from '../assets/characters/giroro.png'
import tamamaImg from '../assets/characters/tamama.png'
import kururuImg from '../assets/characters/kururu.png'
import dororoImg from '../assets/characters/dororo.png'
import type { Category } from '../types'

export const CHARACTERS = {
  keroro: { src: keroroImg, name: 'ケロロ' },
  keroroTile: { src: keroroTileImg, name: 'ケロロ' },
  pink: { src: pinkImg, name: 'ピンクのキャラ' },
  giroro: { src: giroroImg, name: 'ギロロ' },
  tamama: { src: tamamaImg, name: 'タママ' },
  kururu: { src: kururuImg, name: 'クルル' },
  dororo: { src: dororoImg, name: 'ドロロ' },
} as const

export type CharacterName = keyof typeof CHARACTERS

// 予定の種類ごとの担当キャラ（イメージカラーで合わせる）
const CATEGORY_CHARACTER: Record<Category, CharacterName> = {
  sightseeing: 'keroroTile',
  food: 'giroro',
  move: 'dororo',
  hotel: 'tamama',
  other: 'kururu',
}

// 旅のカードのサムネイルに使うキャラ（旅ごとに固定でばらけさせる）
const THUMBNAIL_CHARACTERS: CharacterName[] = ['keroroTile', 'giroro', 'tamama', 'kururu', 'dororo']

export function CharacterBubble({
  character,
  text,
  size = 84,
  reverse = false,
}: {
  character: CharacterName
  text: string
  size?: number
  reverse?: boolean
}) {
  return (
    <div className={reverse ? 'character-bubble reverse' : 'character-bubble'}>
      <img src={CHARACTERS[character].src} alt="" width={size} />
      <p className="speech">{text}</p>
    </div>
  )
}

export function CategoryAvatar({ category, size = 46 }: { category: Category; size?: number }) {
  const character = CHARACTERS[CATEGORY_CHARACTER[category] ?? 'kururu']
  return <img className="category-avatar" src={character.src} alt="" width={size} height={size} />
}

export function TripThumbnail({ tripId }: { tripId: string }) {
  const hash = [...tripId].reduce((sum, c) => sum + c.charCodeAt(0), 0)
  const character = CHARACTERS[THUMBNAIL_CHARACTERS[hash % THUMBNAIL_CHARACTERS.length]]
  return <img className="trip-thumb-img" src={character.src} alt="" width={84} height={84} />
}
