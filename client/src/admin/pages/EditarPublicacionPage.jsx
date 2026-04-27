import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicationEditor from '../../components/admin/PublicationEditor'
import api from '../../services/api'

export default function EditarPublicacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pub, setPub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    api.get(`/admin/publications/${id}`)
      .then(r => setPub(r.data))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  function flash(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  async function handleSaveDraft(payload) {
    setError(null)
    setSaving(true)
    try {
      const updated = await api.put(`/admin/publications/${id}`, { ...payload, status: 'draft' })
      setPub(updated.data)
      flash('Borrador guardado')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(payload) {
    setError(null)
    setPublishing(true)
    try {
      // Save latest fields first, then publish
      await api.put(`/admin/publications/${id}`, payload)
      const res = await api.patch(`/admin/publications/${id}/publish`)
      setPub(p => ({ ...p, ...res.data }))
      flash('Publicada')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al publicar')
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish() {
    setError(null)
    setPublishing(true)
    try {
      const res = await api.patch(`/admin/publications/${id}/unpublish`)
      setPub(p => ({ ...p, ...res.data }))
      flash('Despublicada — ahora es borrador')
    } catch (err) {
      setError(err.response?.data?.error || 'Error')
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/admin/publications/${id}`)
      navigate('/admin/publicaciones', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.span
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="font-display text-5xl text-negro/50 tracking-widest"
        >RE</motion.span>
      </div>
    )
  }

  if (notFound || !pub) {
    return (
      <div className="px-6 py-8">
        <p className="font-mono text-[12px] text-negro/50">Publicación no encontrada.</p>
        <Link to="/admin/publicaciones" className="font-ui text-[10px] uppercase tracking-widest text-rojo mt-3 block">
          ← Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 font-ui text-[10px] uppercase tracking-[0.25em] text-negro/50">
        <Link to="/admin/publicaciones" className="hover:text-negro transition-colors">
          Publicaciones
        </Link>
        <span>→</span>
        <span className="text-negro truncate max-w-[200px]">{pub.title}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 gap-4">
        <h1 className="font-display text-4xl sm:text-5xl text-negro tracking-wide leading-none">
          EDITAR
        </h1>
        {pub.status === 'published' && pub.slug && (
          <a
            href={`/entrevistas/${pub.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-[10px] uppercase tracking-[0.2em] text-negro/50 hover:text-negro transition-colors shrink-0"
          >
            Ver pública ↗
          </a>
        )}
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

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="border border-gris-mid px-4 py-3 mb-6"
        >
          <p className="font-mono text-[11px] text-negro">{successMsg}</p>
        </motion.div>
      )}

      <PublicationEditor
        initialData={pub}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDelete={handleDelete}
        saving={saving}
        publishing={publishing}
      />
    </div>
  )
}
