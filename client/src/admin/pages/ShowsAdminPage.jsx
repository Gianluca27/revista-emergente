import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import ShowForm from '../../components/admin/ShowForm'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

export default function ShowsAdminPage() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  const fetchShows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/shows')
      setShows(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchShows() }, [fetchShows])

  function flashMsg(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2500)
  }

  async function openEdit(show) {
    setError(null)
    try {
      const res = await api.get(`/admin/shows/${show.id}`)
      setEditing(res.data)
      setCreating(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar cobertura')
    }
  }

  async function handleCreate(payload) {
    setError(null); setSaving(true)
    try {
      await api.post('/admin/shows', payload)
      setCreating(false)
      flashMsg('Cobertura creada')
      await fetchShows()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear')
    } finally { setSaving(false) }
  }

  async function handleUpdate(payload) {
    if (!editing) return
    setError(null); setSaving(true)
    try {
      await api.put(`/admin/shows/${editing.id}`, payload)
      setEditing(null)
      flashMsg('Cobertura actualizada')
      await fetchShows()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!editing) return
    setError(null)
    try {
      await api.delete(`/admin/shows/${editing.id}`)
      setEditing(null)
      flashMsg('Cobertura eliminada')
      await fetchShows()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const showForm = creating || editing

  return (
    <div className="px-6 py-8 max-w-6xl">

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-5xl text-negro tracking-wide leading-none">SHOWS</h1>
          <p className="font-mono text-[11px] text-negro/50 mt-1">{shows.length} coberturas</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setError(null) }}
            className="px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150"
          >
            + Cobertura
          </button>
        )}
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-gris-mid px-4 py-3 mb-6"
          >
            <p className="font-mono text-[11px] text-negro">{flash}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-rojo bg-rojo/10 px-4 py-3 mb-6"
        >
          <p className="font-mono text-[11px] text-rojo">{error}</p>
        </motion.div>
      )}

      {showForm ? (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-negro/50">
              {creating ? 'Nueva cobertura' : `Editando: ${editing.title}`}
            </p>
            <button
              onClick={() => { setEditing(null); setCreating(false); setError(null) }}
              className="font-ui text-[10px] uppercase tracking-widest text-negro/50 hover:text-negro transition-colors"
            >
              ← Volver al listado
            </button>
          </div>

          <ShowForm
            initialData={editing}
            onSubmit={creating ? handleCreate : handleUpdate}
            onDelete={editing ? handleDelete : null}
            saving={saving}
          />
        </div>
      ) : (
        <div className="border border-gris-mid">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <motion.span
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="font-display text-5xl text-negro/50 tracking-widest"
              >RE</motion.span>
            </div>
          ) : shows.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-[12px] text-negro/50">Sin coberturas</p>
            </div>
          ) : (
            <ul>
              {shows.map((s, i) => {
                const cover = s.cover_image
                  ? (s.cover_image.startsWith('http') ? s.cover_image : UPLOAD_URL + s.cover_image)
                  : null
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 hover:bg-gris/50 transition-colors duration-100"
                  >
                    {cover ? (
                      <img src={cover} alt="" className="w-16 h-16 object-cover border border-gris-mid shrink-0" />
                    ) : (
                      <div className="w-16 h-16 border border-gris-mid bg-gris flex items-center justify-center font-mono text-[10px] text-negro/50 shrink-0">
                        s/img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[12px] text-negro truncate">{s.title}</p>
                      <p className="font-mono text-[10px] text-negro/50 truncate">
                        {s.venue ? `${s.venue} · ` : ''}{formatDate(s.event_date)}
                      </p>
                    </div>
                    <span className="hidden sm:flex items-center font-mono text-[10px] shrink-0">
                      <span className={[
                        'inline-block w-1.5 h-1.5 rounded-full mr-2',
                        s.status === 'published' ? 'bg-rojo' : 'bg-gris-mid',
                      ].join(' ')} />
                      {s.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                    <button
                      onClick={() => openEdit(s)}
                      className="font-ui text-[10px] uppercase tracking-widest text-negro/50 hover:text-negro transition-colors shrink-0"
                    >
                      Editar →
                    </button>
                  </motion.li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
