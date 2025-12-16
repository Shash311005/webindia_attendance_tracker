import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`app-frame ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Header
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setCollapsed(c => !c)}
      />

      <div className="frame-body">
        {/* ✅ user passed correctly */}
        <Sidebar user={user} />

        <main className="frame-content">
          {children}
        </main>
      </div>
    </div>
  )
}
