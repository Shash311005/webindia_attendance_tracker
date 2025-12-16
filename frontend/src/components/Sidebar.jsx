import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function NavItem({ icon, label, to }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
      <div className="nav-icon">{icon}</div>
      <div className="nav-label">{label}</div>
    </Link>
  )
}

export default function Sidebar({ user }) {
  const role = user?.role

  return (
    <aside className="sidebar">
      <nav className="nav">
        <NavItem icon="🏠" label="Dashboard" to="/dashboard" />

        {(role === 'admin' || role === 'manager') && (
          <NavItem icon="⬆️" label="Uploads" to="/uploads" />
        )}

        <NavItem icon="📊" label="Reports" to="/reports" />

        {role === 'admin' && (
          <NavItem icon="⚙️" label="Settings" to="/settings" />
        )}
      </nav>

      <div className="sidebar-footer">v0.1.0</div>
    </aside>
  )
}
