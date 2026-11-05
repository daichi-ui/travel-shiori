import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarIcon, ChecklistIcon } from './Icons'

// 画面下のタブ（旅程・持ち物）
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
          <CalendarIcon />
          <span>旅程</span>
        </NavLink>
        <NavLink to="/packing" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          <ChecklistIcon />
          <span>持ち物</span>
        </NavLink>
      </nav>
    </div>
  )
}
