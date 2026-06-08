import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        original._retry = true
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
            { refreshToken }
          )
          useAuthStore.getState().login(res.data)
          original.headers.Authorization = `Bearer ${res.data.token}`
          return api(original)
        } catch {
          useAuthStore.getState().logout()
        }
      } else {
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(err)
  }
)

export default api
