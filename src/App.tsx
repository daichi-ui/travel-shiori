import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { TripListPage } from './pages/TripListPage'
import { TripFormPage } from './pages/TripFormPage'
import { TripDetailPage } from './pages/TripDetailPage'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <main className="center">読み込み中…</main>
  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route path="/" element={<TripListPage />} />
      <Route path="/trips/new" element={<TripFormPage />} />
      <Route path="/trips/:tripId" element={<TripDetailPage />} />
      <Route path="/trips/:tripId/edit" element={<TripFormPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
