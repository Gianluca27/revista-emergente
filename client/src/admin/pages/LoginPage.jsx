import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAuthStore(s => s.setUser)
  const [serverError, setServerError] = useState(null)

  const from = location.state?.from?.pathname || '/admin/dashboard'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    setServerError(null)
    try {
      const res = await api.post('/auth/login', data)
      setUser(res.data.user)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión'
      setServerError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-crema flex overflow-hidden admin-fontscale" style={{ zoom: 1.18 }}>
      {/* Left panel — branding */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[45%] border-r border-gris-mid px-14 py-14"
      >
        <span className="font-ui text-[10px] text-rojo uppercase tracking-[0.4em]">
          Panel de administración
        </span>

        <div className="relative">
          <div className="absolute -left-3 top-6 w-0.5 h-24 bg-rojo" />
          <h1
            className="font-grunge leading-none text-rojo select-none"
            style={{ fontSize: 'clamp(6rem, 14vw, 13rem)' }}
          >
            RE
          </h1>
          <p className="font-grunge text-[2.5rem] text-negro/70 leading-tight tracking-[0.05em] mt-1">
            VISTA<br />EMERGENTE
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-mono text-[11px] text-negro/90">// acceso_restringido</p>
          <p className="font-mono text-[11px] text-negro/90">// solo_administración</p>
        </div>
      </motion.div>

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col justify-center flex-1 px-8 sm:px-14 lg:px-20 py-14"
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <h1 className="font-grunge text-5xl text-rojo tracking-wide">EMERGENTE</h1>
          <div className="w-10 h-0.5 bg-rojo mt-2" />
        </div>

        <div className="w-full max-w-sm">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.4 }}
          >
            <h2 className="font-display text-5xl text-negro tracking-[0.1em] mb-1">ACCEDER</h2>
            <p className="font-mono text-[11px] text-negro/90 mb-10 tracking-wide">
              Ingresá tus credenciales de administración
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="block font-ui text-[11px] text-negro/90 uppercase tracking-[0.25em] mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className={[
                  'w-full bg-gris text-negro font-mono text-sm px-4 py-3',
                  'border transition-colors duration-150 focus:outline-none placeholder-gris-mid',
                  errors.email ? 'border-rojo' : 'border-gris-mid focus:border-rojo',
                ].join(' ')}
                placeholder="admin@revistaemergente.ar"
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-rojo mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block font-ui text-[11px] text-negro/90 uppercase tracking-[0.25em] mb-2">
                Contraseña
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={[
                  'w-full bg-gris text-negro font-mono text-sm px-4 py-3',
                  'border transition-colors duration-150 focus:outline-none',
                  errors.password ? 'border-rojo' : 'border-gris-mid focus:border-rojo',
                ].join(' ')}
              />
              {errors.password && (
                <p className="font-mono text-[10px] text-rojo mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-rojo bg-rojo/10 px-4 py-3"
              >
                <p className="font-mono text-[11px] text-rojo">{serverError}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ backgroundColor: '#7A0F14' }}
              whileTap={{ scale: 0.985 }}
              className="w-full bg-rojo text-crema font-ui text-sm uppercase tracking-[0.3em] py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? 'Verificando...' : 'Ingresar'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
