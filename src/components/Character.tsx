import keroroImg from '../assets/characters/keroro.png'
import giroroImg from '../assets/characters/giroro.png'
import tamamaImg from '../assets/characters/tamama.png'
import kururuImg from '../assets/characters/kururu.png'
import dororoImg from '../assets/characters/dororo.png'

export const CHARACTERS = {
  keroro: { src: keroroImg, name: 'ケロロ' },
  giroro: { src: giroroImg, name: 'ギロロ' },
  tamama: { src: tamamaImg, name: 'タママ' },
  kururu: { src: kururuImg, name: 'クルル' },
  dororo: { src: dororoImg, name: 'ドロロ' },
} as const

export type CharacterName = keyof typeof CHARACTERS

// 旅のカードのサムネイルに使うキャラ（旅ごとに固定でばらけさせる）
const THUMBNAIL_CHARACTERS: CharacterName[] = ['keroro', 'giroro', 'tamama', 'kururu', 'dororo']

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

export function TripThumbnail({ tripId }: { tripId: string }) {
  const hash = [...tripId].reduce((sum, c) => sum + c.charCodeAt(0), 0)
  const character = CHARACTERS[THUMBNAIL_CHARACTERS[hash % THUMBNAIL_CHARACTERS.length]]
  return <img className="trip-thumb-img" src={character.src} alt="" width={84} height={84} />
}
