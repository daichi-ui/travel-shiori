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
      <img className="login-hero" src={CHARACTERS.keroro.src} alt="" width={150} height={150} />
      <h1 className="brand">旅のしおり</h1>
      <div className="login-squad" aria-hidden="true">
        {(['giroro', 'tamama', 'kururu', 'dororo'] as const).map((name) => (
          <img key={name} src={CHARACTERS[name].src} alt="" width={60} height={60} />
        ))}
      </div>
      <p className="speech">みんなで旅の作戦会議であります！</p>
      <button className="primary-large" onClick={handleLogin}>
        Googleでログイン
      </button>
      {error && <p className="error">{error}</p>}
    </main>
  )
}
