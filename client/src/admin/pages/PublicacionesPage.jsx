import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const STATUS_LABELS = {
  all: 'Todas',
  published: 'Publicadas',
  draft: 'Borradores',
}

function StatusDot({ status }) {
  return (
    <span className={[
      'inline-block w-1.5 h-1.5 rounded-full mr-2',
      status === 'published' ? 'bg-rojo' : 'bg-gris-mid',
    ].join(' ')} />
  )
}

function ConfirmDialog({ title, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-negro/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-gris border border-gris-mid p-6 max-w-sm w-full"
      >
        <h3 className="font-display text-2xl text-blanco tracking-wide mb-2">CONFIRMAR</h3>
        <p className="font-mono text-[12px] text-gris-mid mb-6 leading-relaxed">
          ¿Eliminar <span className="text-blanco">"{title}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-rojo font-ui text-[10px] uppercase tracking-[0.25em] text-blanco hover:bg-red-800 transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gris-mid font-ui text-[10px] uppercase tracking-[0.25em] text-gris-mid hover:text-blanco hover:border-blanco transition-colors"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PublicacionesPage() {
  const [pubs, setPubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const navigate = useNavigate()

  const fetchPubs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await api.get('/admin/publications', { params })
      setPubs(res.data.data)
      setPagination(res.data.pagination)
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => { fetchPubs() }, [fetchPubs])

  async function handleToggleStatus(pub) {
    setActionLoading(pub.id)
    try {
      if (pub.status === 'published') {
        await api.patch(`/admin/publications/${pub.id}/unpublish`)
      } else {
        await api.patch(`/admin/publications/${pub.id}/publish`)
      }
      await fetchPubs()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setActionLoading(toDelete.id)
    try {
      await api.delete(`/admin/publications/${toDelete.id}`)
      setToDelete(null)
      await fetchPubs()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="px-6 py-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl text-blanco tracking-wide leading-none">PUBLICACIONES</h1>
          {pagination && (
            <p className="font-mono text-[11px] text-gris-mid mt-1">
              {pagination.total} en total
            </p>
          )}
        </div>
        <Link
          to="/admin/publicaciones/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-blanco hover:bg-red-800 transition-colors duration-150"
        >
          + Nueva
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 mb-6">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key); setPage(1) }}
            className={[
              'px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.2em] border transition-colors duration-150',
              statusFilter === key
                ? 'border-rojo text-rojo bg-rojo/10'
                : 'border-gris-mid text-gris-mid hover:border-blanco/30 hover:text-blanco',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-gris-mid overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[1fr_140px_100px_120px] gap-4 px-4 py-2 bg-negro/40 border-b border-gris-mid">
          {['Título', 'Categoría', 'Estado', 'Acciones'].map(h => (
            <span key={h} className="font-ui text-[9px] uppercase tracking-[0.3em] text-gris-mid">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <motion.span
              animate={{ opacity: [0.15, 0.7, 0.15] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="font-display text-5xl text-gris-mid tracking-widest"
            >RE</motion.span>
          </div>
        ) : pubs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-[12px] text-gris-mid">Sin publicaciones</p>
          </div>
        ) : (
          <ul>
            {pubs.map((pub, i) => (
              <motion.li
                key={pub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-1 sm:grid-cols-[1fr_140px_100px_120px] gap-4 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 hover:bg-gris/50 transition-colors duration-100 items-center"
              >
                {/* Title */}
                <div className="min-w-0">
                  <p className="font-ui text-[12px] text-blanco leading-tight truncate">
                    {pub.title}
                  </p>
                  {pub.subtitle && (
                    <p className="font-mono text-[10px] text-gris-mid truncate mt-0.5">{pub.subtitle}</p>
                  )}
                </div>

                {/* Category */}
                <span className="font-ui text-[10px] uppercase tracking-[0.15em] text-gris-mid">
                  {pub.category?.name ?? '—'}
                </span>

                {/* Status */}
                <span className="flex items-center font-mono text-[10px]">
                  <StatusDot status={pub.status} />
                  {pub.status === 'published' ? 'Publicada' : 'Borrador'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/publicaciones/${pub.id}/editar`}
                    className="font-ui text-[10px] uppercase tracking-widest text-gris-mid hover:text-blanco transition-colors"
                  >
                    Editar
                  </Link>
                  <span className="text-gris-mid">·</span>
                  <button
                    onClick={() => handleToggleStatus(pub)}
                    disabled={actionLoading === pub.id}
                    className={[
                      'font-ui text-[10px] uppercase tracking-widest transition-colors',
                      pub.status === 'published'
                        ? 'text-gris-mid hover:text-blanco'
                        : 'text-rojo hover:text-red-400',
                      actionLoading === pub.id ? 'opacity-40 cursor-wait' : '',
                    ].join(' ')}
                  >
                    {actionLoading === pub.id ? '…' : pub.status === 'published' ? 'Despub.' : 'Publicar'}
                  </button>
                  <span className="text-gris-mid">·</span>
                  <button
                    onClick={() => setToDelete(pub)}
                    disabled={actionLoading === pub.id}
                    className="font-ui text-[10px] uppercase tracking-widest text-gris-mid hover:text-rojo transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="font-ui text-[10px] uppercase tracking-widest text-gris-mid hover:text-blanco disabled:opacity-30 transition-colors"
          >← Anterior</button>
          <span className="font-mono text-[11px] text-gris-mid">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="font-ui text-[10px] uppercase tracking-widest text-gris-mid hover:text-blanco disabled:opacity-30 transition-colors"
          >Siguiente →</button>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {toDelete && (
          <ConfirmDialog
            title={toDelete.title}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
