import React, { useState } from 'react'
import { login } from '../api'

export default function Login({ onSuccess, onSwitch }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  const submit = async e => {
    e.preventDefault(); setErr(null);
    try{
      const data = await login(email, password)
      onSuccess(data.user)
      // store token and user locally for persistence across refresh
      localStorage.setItem('token', data.token)
      try{ localStorage.setItem('user', JSON.stringify(data.user)) }catch(e){}
    }catch(err){
      setErr(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="auth-root">
      <div className="brand">
        <div className="logo">ET</div>
        <div>
          <div className="app-title">Engineer Productivity</div>
          <div className="app-sub">Dashboard & Attendance Analytics</div>
        </div>
      </div>

      <h2 className="title">Sign in</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input aria-label="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input aria-label="password" type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {err && <div className="error">{err}</div>}
        <div className="form-actions">
          <div className="muted">Don't have an account? <button className="link" onClick={onSwitch}>Register</button></div>
          <button className="btn" type="submit">Sign in</button>
        </div>
      </form>
    </div>
  )
}
