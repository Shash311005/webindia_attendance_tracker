import React from 'react'

export default function Dashboard({ user, onLogout }){
  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <div className="app-title">Hello, {user.name}</div>
          <div className="muted">Employee: {user.employee_id} • {user.role}</div>
        </div>
        <div>
          <button className="btn ghost" onClick={()=>{ localStorage.removeItem('token'); onLogout(); }}>Logout</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <h2>Engineer Productivity & Attendance</h2>
          <p className="muted">Upload attendance and ticket CSVs to get interactive reports and insights.</p>
        </section>

        <section className="cards">
          <div className="card small">
            <div className="stat"><div className="icon">🕒</div><div><strong>Daily Hours</strong><div className="muted">Avg 7.8 hrs</div></div></div>
          </div>
          <div className="card small">
            <div className="stat"><div className="icon">✅</div><div><strong>SLA Adherence</strong><div className="muted">92%</div></div></div>
          </div>
          <div className="card small">
            <div className="stat"><div className="icon">📈</div><div><strong>Tickets Closed</strong><div className="muted">Avg 15/day</div></div></div>
          </div>
          <div className="card small">
            <div className="stat"><div className="icon">⚠️</div><div><strong>Alerts</strong><div className="muted">2 today</div></div></div>
          </div>
        </section>
      </main>
    </div>
  )
}
