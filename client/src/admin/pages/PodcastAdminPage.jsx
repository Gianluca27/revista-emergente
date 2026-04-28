import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import EpisodeForm from '../../components/admin/EpisodeForm'

export default function PodcastAdminPage() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  const fetchEpisodes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/podcast')
      setEpisodes(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEpisodes() }, [fetchEpisodes])

  function flashMsg(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2500)
  }

  async function openEdit(ep) {
    setError(null)
    try {
      const res = await api.get(`/admin/podcast/${ep.id}`)
      setEditing(res.data)
      setCreating(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar episodio')
    }
  }

  async function handleCreate(payload) {
    setError(null); setSaving(true)
    try {
      await api.post('/admin/podcast', payload)
      setCreating(false)
      flashMsg('Episodio creado')
      await fetchEpisodes()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear')
    } finally { setSaving(false) }
  }

  async function handleUpdate(payload) {
    if (!editing) return
    setError(null); setSaving(true)
    try {
      await api.put(`/admin/podcast/${editing.id}`, payload)
      setEditing(null)
      flashMsg('Episodio actualizado')
      await fetchEpisodes()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!editing) return
    setError(null)
    try {
      await api.delete(`/admin/podcast/${editing.id}`)
      setEditing(null)
      flashMsg('Episodio eliminado')
      await fetchEpisodes()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const showForm = creating || editing

  return (
    <div className="px-6 py-8 max-w-6xl">

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-5xl text-negro tracking-wide leading-none">PODCAST</h1>
          <p className="font-mono text-[11px] text-negro/90 mt-1">{episodes.length} episodios</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setError(null) }}
            className="px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150"
          >
            + Episodio
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
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-negro/90">
              {creating ? 'Nuevo episodio' : `Editando: ${editing.title}`}
            </p>
            <button
              onClick={() => { setEditing(null); setCreating(false); setError(null) }}
              className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
            >
              ← Volver al listado
            </button>
          </div>

          <EpisodeForm
            initialData={editing}
            onSubmit={creating ? handleCreate : handleUpdate}
            onDelete={editing ? handleDelete : null}
            saving={saving}
          />
        </div>
      ) : (
        <div className="border border-gris-mid">
          <div className="hidden sm:grid grid-cols-[60px_1fr_100px_100px_100px] gap-4 px-4 py-2 bg-crema/40 border-b border-gris-mid">
            {['#', 'Título', 'Duración', 'Estado', ''].map(h => (
              <span key={h} className="font-ui text-[9px] uppercase tracking-[0.3em] text-negro/90">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <motion.span
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="font-display text-5xl text-negro/90 tracking-widest"
              >RE</motion.span>
            </div>
          ) : episodes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-[12px] text-negro/90">Sin episodios</p>
            </div>
          ) : (
            <ul>
              {episodes.map((ep, i) => (
                <motion.li
                  key={ep.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 sm:grid-cols-[60px_1fr_100px_100px_100px] gap-4 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 hover:bg-gris/50 transition-colors duration-100 items-center"
                >
                  <span className="font-display text-2xl text-rojo leading-none">
                    {ep.episode_number ? String(ep.episode_number).padStart(2, '0') : '—'}
                  </span>
                  <p className="font-ui text-[12px] text-negro truncate">{ep.title}</p>
                  <span className="font-mono text-[10px] text-negro/90">
                    {ep.duration_min ? `${ep.duration_min} min` : '—'}
                  </span>
                  <span className="flex items-center font-mono text-[10px]">
                    <span className={[
                      'inline-block w-1.5 h-1.5 rounded-full mr-2',
                      ep.status === 'published' ? 'bg-rojo' : 'bg-gris-mid',
                    ].join(' ')} />
                    {ep.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  <button
                    onClick={() => openEdit(ep)}
                    className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors text-left"
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
