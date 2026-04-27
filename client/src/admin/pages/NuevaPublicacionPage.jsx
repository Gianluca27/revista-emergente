import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicationEditor from '../../components/admin/PublicationEditor'
import api from '../../services/api'

export default function NuevaPublicacionPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)

  async function handleSaveDraft(payload) {
    setError(null)
    setSaving(true)
    try {
      const res = await api.post('/admin/publications', { ...payload, status: 'draft' })
      navigate(`/admin/publicaciones/${res.data.id}/editar`, { replace: true })
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
      const res = await api.post('/admin/publications', { ...payload, status: 'published' })
      navigate(`/admin/publicaciones/${res.data.id}/editar`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al publicar')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="px-6 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 font-ui text-[10px] uppercase tracking-[0.25em] text-negro/50">
        <Link to="/admin/publicaciones" className="hover:text-negro transition-colors">
          Publicaciones
        </Link>
        <span>→</span>
        <span className="text-negro">Nueva</span>
      </nav>

      <h1 className="font-display text-5xl text-negro tracking-wide leading-none mb-8">
        NUEVA PUBLICACIÓN
      </h1>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-rojo bg-rojo/10 px-4 py-3 mb-6"
        >
          <p className="font-mono text-[11px] text-rojo">{error}</p>
        </motion.div>
      )}

      <PublicationEditor
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        saving={saving}
        publishing={publishing}
      />
    </div>
  )
}
