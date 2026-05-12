import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import api from '../../services/api'
import TeamMemberForm from '../../components/admin/TeamMemberForm'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

function resolvePhoto(photo) {
  if (!photo) return null
  return photo.startsWith('http') ? photo : UPLOAD_URL + photo
}

function MemberThumb({ photo, name }) {
  const src = resolvePhoto(photo)
  return src ? (
    <img src={src} alt={name} className="w-12 h-12 object-cover border border-gris-mid" />
  ) : (
    <div className="w-12 h-12 flex items-center justify-center bg-gris border border-gris-mid font-display text-lg text-negro/90">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function EquipoAdminPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/team')
      setMembers(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  function flashMsg(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2500)
  }

  async function openEdit(member) {
    setError(null)
    try {
      const res = await api.get(`/admin/team/${member.id}`)
      setEditing(res.data)
      setCreating(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el miembro')
    }
  }

  async function handleCreate(payload) {
    setError(null); setSaving(true)
    try {
      await api.post('/admin/team', payload)
      setCreating(false)
      flashMsg('Miembro creado')
      await fetchMembers()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear')
    } finally { setSaving(false) }
  }

  async function handleUpdate(payload) {
    if (!editing) return
    setError(null); setSaving(true)
    try {
      await api.put(`/admin/team/${editing.id}`, payload)
      setEditing(null)
      flashMsg('Miembro actualizado')
      await fetchMembers()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!editing) return
    setError(null)
    try {
      await api.delete(`/admin/team/${editing.id}`)
      setEditing(null)
      flashMsg('Miembro eliminado')
      await fetchMembers()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
    }
  }

  async function handleReorder(next) {
    const prev = members
    setMembers(next) // optimista
    try {
      await api.patch('/admin/team/reorder', { ids: next.map(m => m.id) })
    } catch (err) {
      setMembers(prev) // revertir
      setError(err.response?.data?.error || 'Error al reordenar')
    }
  }

  const showForm = creating || editing

  return (
    <div className="px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-5xl text-negro tracking-wide leading-none">EQUIPO</h1>
          <p className="font-mono text-[11px] text-negro/90 mt-1">{members.length} miembros</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setError(null) }}
            className="px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150"
          >
            + Nuevo miembro
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
              {creating ? 'Nuevo miembro' : `Editando: ${editing.name}`}
            </p>
            <button
              onClick={() => { setEditing(null); setCreating(false); setError(null) }}
              className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
            >
              ← Volver al listado
            </button>
          </div>

          <TeamMemberForm
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
                className="font-display text-5xl text-negro/90 tracking-widest"
              >RE</motion.span>
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-[12px] text-negro/90 mb-3">Sin miembros cargados</p>
              <button
                onClick={() => setCreating(true)}
                className="font-ui text-[10px] uppercase tracking-[0.25em] text-rojo hover:underline"
              >
                + Cargar el primero
              </button>
            </div>
          ) : (
            <>
              <Reorder.Group axis="y" values={members} onReorder={handleReorder}>
                {members.map((m) => (
                  <Reorder.Item
                    key={m.id}
                    value={m}
                    className="flex items-center gap-4 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 bg-crema hover:bg-gris/50 transition-colors duration-100 cursor-grab active:cursor-grabbing"
                  >
                    <span className="font-mono text-[10px] text-negro/40 select-none">⠿</span>
                    <MemberThumb photo={m.photo} name={m.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[12px] text-negro truncate">{m.name}</p>
                      {m.role && <p className="font-mono text-[10px] text-negro/90 truncate">{m.role}</p>}
                    </div>
                    <button
                      onClick={() => openEdit(m)}
                      className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
                    >
                      Editar →
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              <p className="font-mono text-[9px] text-negro/90 px-4 py-2 border-t border-gris-mid">
                Arrastrá las filas para reordenar el equipo
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
