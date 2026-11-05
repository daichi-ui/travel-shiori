import keroroImg from '../assets/characters/keroro.png'
import pinkImg from '../assets/characters/pink.png'

export const CHARACTERS = {
  keroro: { src: keroroImg, name: 'ケロロ' },
  pink: { src: pinkImg, name: 'ピンクのキャラ' },
} as const

export type CharacterName = keyof typeof CHARACTERS

// キャラクター + ふきだし。reverse でキャラを右側に置く
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
