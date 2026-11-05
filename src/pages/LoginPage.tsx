import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

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
      <h1 className="brand">旅のしおり</h1>
      <p>友だちと一緒に旅行の予定をつくろう</p>
      <button onClick={handleLogin}>Googleでログイン</button>
      {error && <p className="error">{error}</p>}
    </main>
  )
}
