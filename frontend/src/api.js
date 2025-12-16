import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true
})

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function register(employee_id, name, email, password, role = 'user') {
  const res = await api.post('/auth/register', {
    employee_id,
    name,
    email,
    password,
    role
  })
  return res.data
}

export async function getRoles() {
  const res = await api.get('/auth/roles')
  return res.data
}

export default api
