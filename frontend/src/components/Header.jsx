import React from 'react'

export default function Header({ onToggleSidebar }){
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          <span className="hamburger" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className="brand-inline">
          <div className="logo small">ET</div>
          <div className="brand-text">
            <div className="brand-name">Engineer Tracker</div>
            <div className="brand-tag">Productivity & Attendance</div>
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <input className="top-search" placeholder="Search engineers, tickets, requests..." />
      </div>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications">🔔</button>
        <button className="icon-btn" aria-label="Settings">⚙️</button>
        <div className="avatar">S</div>
      </div>
    </header>
  )
}
