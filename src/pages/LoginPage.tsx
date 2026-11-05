import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { CHARACTERS } from '../components/Character'

export function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login()
    } catch (e) {
      console.error(e)
      setError('ログインできませんでした。もう一度お試しください。')
    }
  }

  return (
    <main className="center">
      <div className="login-characters" aria-hidden="true">
        <img className="keroro" src={CHARACTERS.keroro.src} alt="" />
        <img className="pink" src={CHARACTERS.pink.src} alt="" />
      </div>
      <h1 className="brand">旅のしおり</h1>
      <p className="speech">みんなで旅の作戦会議であります！</p>
      <button className="primary-large" onClick={handleLogin}>
        Googleでログイン
      </button>
      {error && <p className="error">{error}</p>}
    </main>
  )
}
