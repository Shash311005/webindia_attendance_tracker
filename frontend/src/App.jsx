import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'
import Uploads from './components/Uploads'

// ---------------- Pages ----------------
function UploadsPage() {
  return <h2>Uploads Page</h2>
}

function ReportsPage() {
  return <h2>Reports Page</h2>
}

function SettingsPage() {
  return <h2>Settings Page</h2>
}

// ---------------- Protected Layout ----------------
function ProtectedLayout({ user, onLogout, children }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      {children}
    </Layout>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  const [view, setView] = useState('login')

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setView('login')
  }

  return (
    <Routes>
      {/* ---------- LOGIN / REGISTER ---------- */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : view === 'login' ? (
            <Login onSuccess={setUser} onSwitch={() => setView('register')} />
          ) : (
            <Register onRegistered={setUser} onSwitch={() => setView('login')} />
          )
        }
      />

      {/* ---------- DASHBOARD ---------- */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <ProtectedLayout user={user} onLogout={handleLogout}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ---------- UPLOADS (admin + manager) ---------- */}
      <Route
  path="/uploads"
  element={
    user && (user.role === 'admin' || user.role === 'manager') ? (
      <ProtectedLayout user={user} onLogout={handleLogout}>
        <Uploads />
      </ProtectedLayout>
    ) : (
      <Navigate to="/dashboard" replace />
    )
  }
/>


      {/* ---------- REPORTS ---------- */}
      <Route
        path="/reports"
        element={
          user ? (
            <ProtectedLayout user={user} onLogout={handleLogout}>
              <ReportsPage />
            </ProtectedLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ---------- SETTINGS (admin only) ---------- */}
      <Route
        path="/settings"
        element={
          user && user.role === 'admin' ? (
            <ProtectedLayout user={user} onLogout={handleLogout}>
              <SettingsPage />
            </ProtectedLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
