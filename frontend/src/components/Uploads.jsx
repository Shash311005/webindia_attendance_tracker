import React, { useState } from 'react'
import api from '../api'

export default function Uploads() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return alert('Select a file')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      const res = await api.post('/uploads/attendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Attendance CSV</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={e => setFile(e.target.files[0])}
        />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}
