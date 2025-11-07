import axios from 'axios'

const api = axios.create({
  baseURL: '/', // proxied by quasar devServer to backend
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const AuthAPI = {
  async login({ email, password }) {
    const { data } = await api.post('/api/login', { email, password })
    return data
  },
  async signup({ email, password, firstName, lastName }) {
    const { data } = await api.post('/api/signup', { email, password, firstName, lastName })
    return data
  },
  async logout() {
    try {
      await api.post('/api/logout')
    } catch (e) {
      console.log("🚀 ~ e:", e)
      // ignore errors on logout
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

export const CollaboratorsAPI = {
  async list() {
    const { data } = await api.get('/api/collaborators')
    return data
  },
  async get(id) {
    const { data } = await api.get(`/api/collaborators/${id}`)
    return data
  },
  async create(payload) {
    const { data } = await api.post('/api/collaborators', payload)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/collaborators/${id}`, payload)
    return data
  },
  async remove(id) {
    await api.delete(`/api/collaborators/${id}`)
  },
}

export default api
