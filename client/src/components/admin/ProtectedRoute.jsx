import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute() {
  const [status, setStatus] = useState('checking') // 'checking' | 'ok' | 'denied'
  const setUser = useAuthStore(s => s.setUser)
  const location = useLocation()

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUser(res.data)
        setStatus('ok')
      })
      .catch(() => setStatus('denied'))
  }, [setUser])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-negro flex items-center justify-center">
        <motion.p
          animate={{ opacity: [0.12, 0.7, 0.12] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="font-display text-8xl text-gris-mid tracking-widest select-none"
        >
          RE
        </motion.p>
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
