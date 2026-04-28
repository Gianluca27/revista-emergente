import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import ArtistForm from '../../components/admin/ArtistForm'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

function ArtistAvatar({ photo, name }) {
  const src = photo ? (photo.startsWith('http') ? photo : UPLOAD_URL + photo) : null
  return src ? (
    <img src={src} alt={name} className="w-12 h-12 object-cover rounded-full border border-gris-mid" />
  ) : (
    <div className="w-12 h-12 flex items-center justify-center bg-gris border border-gris-mid font-display text-lg text-negro/90 rounded-full">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function ArtistasPage() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  const fetchArtists = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/artists')
      setArtists(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArtists() }, [fetchArtists])

  function flashMsg(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2500)
  }

  async function openEdit(artist) {
    setError(null)
    try {
      const res = await api.get(`/admin/artists/${artist.id}`)
      setEditing(res.data)
      setCreating(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar artista')
    }
  }

  async function handleCreate(payload) {
    setError(null); setSaving(true)
    try {
      await api.post('/admin/artists', payload)
      setCreating(false)
      flashMsg('Artista creado')
      await fetchArtists()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear')
    } finally { setSaving(false) }
  }

  async function handleUpdate(payload) {
    if (!editing) return
    setError(null); setSaving(true)
    try {
      await api.put(`/admin/artists/${editing.id}`, payload)
      setEditing(null)
      flashMsg('Artista actualizado')
      await fetchArtists()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!editing) return
    setError(null)
    try {
      await api.delete(`/admin/artists/${editing.id}`)
      setEditing(null)
      flashMsg('Artista eliminado')
      await fetchArtists()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const showForm = creating || editing

  return (
    <div className="px-6 py-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-5xl text-negro tracking-wide leading-none">ARTISTAS</h1>
          <p className="font-mono text-[11px] text-negro/90 mt-1">{artists.length} cargados</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setError(null) }}
            className="px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150"
          >
            + Nuevo
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

      {/* Form mode */}
      {showForm ? (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-negro/90">
              {creating ? 'Nuevo artista' : `Editando: ${editing.name}`}
            </p>
            <button
              onClick={() => { setEditing(null); setCreating(false); setError(null) }}
              className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
            >
              ← Volver al listado
            </button>
          </div>

          <ArtistForm
            initialData={editing}
            onSubmit={creating ? handleCreate : handleUpdate}
            onDelete={editing ? handleDelete : null}
            saving={saving}
          />
        </div>
      ) : (
        // List mode
        <div className="border border-gris-mid">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <motion.span
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="font-display text-5xl text-negro/90 tracking-widest"
              >RE</motion.span>
            </div>
          ) : artists.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-[12px] text-negro/90 mb-3">Sin artistas cargados</p>
              <button
                onClick={() => setCreating(true)}
                className="font-ui text-[10px] uppercase tracking-[0.25em] text-rojo hover:underline"
              >
                + Cargar el primero
              </button>
            </div>
          ) : (
            <ul>
              {artists.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 hover:bg-gris/50 transition-colors duration-100"
                >
                  <ArtistAvatar photo={a.photo} name={a.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[12px] text-negro truncate">{a.name}</p>
                    <p className="font-mono text-[10px] text-negro/90 truncate">/artistas/{a.slug}</p>
                  </div>
                  {a.instagram_url && (
                    <span className="hidden sm:inline font-mono text-[10px] text-negro/90">IG</span>
                  )}
                  <button
                    onClick={() => openEdit(a)}
                    className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
                  >
                    Editar →
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
