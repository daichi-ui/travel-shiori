import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CHARACTERS } from './Character'

// 画面下のタブ（旅程・持ち物）。アイコンはキャラ
export function AppLayout() {
  const { pathname } = useLocation()
  const inTrips = pathname === '/' || pathname.startsWith('/trips')

  return (
    <div className="app">
      <div className="app-body">
        <Outlet />
      </div>
      <nav className="tab-bar">
        <NavLink to="/" className={inTrips ? 'tab active' : 'tab'}>
          <img src={CHARACTERS.keroro.src} alt="" width={34} height={34} />
          <span>旅程</span>
        </NavLink>
        <NavLink to="/packing" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          <img src={CHARACTERS.giroro.src} alt="" width={34} height={34} />
          <span>持ち物</span>
        </NavLink>
      </nav>
    </div>
  )
}
