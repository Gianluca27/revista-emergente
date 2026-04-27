import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import ContactDrawer from '../../components/admin/ContactDrawer'

const FILTERS = [
  { key: 'all',      label: 'Todos' },
  { key: 'pending',  label: 'Pendientes' },
  { key: 'read',     label: 'Leídos' },
  { key: 'archived', label: 'Archivados' },
]

function formatRelative(d) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    const diffMs = Date.now() - dt.getTime()
    const min = Math.floor(diffMs / 60000)
    if (min < 1) return 'ahora'
    if (min < 60) return `hace ${min}m`
    const h = Math.floor(min / 60)
    if (h < 24) return `hace ${h}h`
    const days = Math.floor(h / 24)
    if (days < 30) return `hace ${days}d`
    return dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  } catch { return d }
}

export default function ContactoAdminPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter === 'all' ? {} : { status: filter }
      const res = await api.get('/admin/contact', { params })
      setContacts(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const counts = useMemo(() => {
    const c = { pending: 0, read: 0, archived: 0 }
    contacts.forEach(x => { if (c[x.status] !== undefined) c[x.status]++ })
    return c
  }, [contacts])

  async function openContact(c) {
    setActive(c)
    // Auto-mark as read when opening a pending message
    if (c.status === 'pending') {
      try {
        const res = await api.patch(`/admin/contact/${c.id}/status`, { status: 'read' })
        setActive(res.data)
        setContacts(list => list.map(x => x.id === c.id ? res.data : x))
      } catch {
        // ignore — just keep showing without auto-update
      }
    }
  }

  async function handleUpdateStatus(status) {
    if (!active) return
    setUpdating(true)
    try {
      const res = await api.patch(`/admin/contact/${active.id}/status`, { status })
      setActive(res.data)
      setContacts(list => list.map(x => x.id === active.id ? res.data : x))
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar estado')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="px-6 py-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl text-negro tracking-wide leading-none">MENSAJES</h1>
        <p className="font-mono text-[11px] text-negro/50 mt-1">
          {contacts.length} en vista
          {filter === 'all' && counts.pending > 0 && (
            <> · <span className="text-rojo">{counts.pending} sin leer</span></>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.2em] border transition-colors duration-150',
              filter === f.key
                ? 'border-rojo text-rojo bg-rojo/10'
                : 'border-gris-mid text-negro/50 hover:border-negro/30 hover:text-negro',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-rojo bg-rojo/10 px-4 py-3 mb-6"
        >
          <p className="font-mono text-[11px] text-rojo">{error}</p>
        </motion.div>
      )}

      {/* List */}
      <div className="border border-gris-mid">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <motion.span
              animate={{ opacity: [0.15, 0.7, 0.15] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="font-display text-5xl text-negro/50 tracking-widest"
            >RE</motion.span>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-[12px] text-negro/50">
              {filter === 'pending' ? 'Bandeja al día — no hay mensajes pendientes' : 'Sin mensajes'}
            </p>
          </div>
        ) : (
          <ul>
            {contacts.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <button
                  onClick={() => openContact(c)}
                  className={[
                    'w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 hover:bg-gris/50 transition-colors duration-100',
                    c.status === 'pending' ? 'bg-rojo/5' : '',
                  ].join(' ')}
                >
                  <span className={[
                    'inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0',
                    c.status === 'pending'  ? 'bg-rojo' :
                    c.status === 'read'     ? 'bg-crema/40' :
                                              'bg-gris-mid',
                  ].join(' ')} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={[
                        'font-ui text-[12px] truncate',
                        c.status === 'pending' ? 'text-negro' : 'text-negro/50',
                      ].join(' ')}>
                        {c.name}
                        {c.project_name && (
                          <span className="text-negro/50"> · {c.project_name}</span>
                        )}
                      </p>
                      <span className="font-mono text-[10px] text-negro/50 shrink-0">
                        {formatRelative(c.created_at)}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-negro/50 truncate mt-0.5">
                      {c.message}
                    </p>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <ContactDrawer
        contact={active}
        onClose={() => setActive(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updating}
      />
    </div>
  )
}
