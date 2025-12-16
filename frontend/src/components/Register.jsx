import React, { useState, useEffect } from 'react'
import { register, login, getRoles } from '../api'

export default function Register({ onRegistered, onSwitch }){
  const [employeeId, setEmployeeId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [err, setErr] = useState(null)
  const [availableRoles, setAvailableRoles] = useState(['user','manager','admin'])

  useEffect(()=>{
    // fetch roles from backend if available
    let mounted = true
    getRoles().then(r => {
      if (!mounted) return
      if (Array.isArray(r) && r.length) setAvailableRoles(r.map(x => x.name))
    }).catch(()=>{
      // ignore - keep default roles
    })
    return ()=>{ mounted = false }
  },[])

  const submit = async e => {
    e.preventDefault(); setErr(null);
    try{
      await register(employeeId, name, email, password, role)
      // auto-login
      const data = await login(email, password)
      localStorage.setItem('token', data.token)
      try{ localStorage.setItem('user', JSON.stringify(data.user)) }catch(e){}
      onRegistered(data.user)
    }catch(err){
      setErr(err?.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="auth-root">
      <div className="brand">
        <div className="logo">ET</div>
        <div>
          <div className="app-title">Create your account</div>
          <div className="app-sub">Start tracking productivity and attendance</div>
        </div>
      </div>

      <h2 className="title">Create account</h2>
      <form onSubmit={submit}>
        <label>Employee ID</label>
        <input aria-label="employee-id" placeholder="E12345" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} required />
        <label>Name</label>
        <input aria-label="name" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email</label>
        <input aria-label="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Role</label>
        <select aria-label="role" value={role} onChange={e=>setRole(e.target.value)}>
          {availableRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
        </select>
        <label>Password</label>
        <input aria-label="password" type="password" placeholder="Choose a secure password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {err && <div className="error">{err}</div>}
        <div className="form-actions">
          <div className="muted">Already have an account? <button className="link" onClick={onSwitch}>Sign in</button></div>
          <button className="btn" type="submit">Create account</button>
        </div>
      </form>
    </div>
  )
}
