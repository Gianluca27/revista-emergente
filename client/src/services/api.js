import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isAuthCheck = err.config?.url?.includes('/auth/me')
      const onLoginPage = window.location.pathname === '/admin/login'
      if (!isAuthCheck && !onLoginPage) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
