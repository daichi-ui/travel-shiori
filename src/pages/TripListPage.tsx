import { useAuth } from '../auth/AuthContext'

// しおり一覧（次のステップで Firestore と接続する）
export function TripListPage() {
  const { user, logout } = useAuth()

  return (
    <main>
      <header className="header">
        <h1>しおり一覧</h1>
        <button className="secondary" onClick={logout}>
          ログアウト
        </button>
      </header>
      <p>{user?.displayName} さん、ようこそ。</p>
      <p>しおりはまだありません。</p>
    </main>
  )
}
