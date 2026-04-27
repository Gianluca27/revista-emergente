import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImageUploader({ value, onChange, label = 'Imagen de portada' }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const previewSrc = value
    ? (value.startsWith('http') ? value : UPLOAD_URL + value)
    : null

  const upload = useCallback(async (file) => {
    if (!file) return
    setError(null)

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se aceptan JPG, PNG o WebP')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('El archivo excede 5MB')
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.url)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files?.[0])
  }, [upload])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="space-y-2">
      <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-negro/50">
        {label}
      </label>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          'relative border transition-colors duration-150 cursor-pointer overflow-hidden',
          dragging ? 'border-rojo bg-rojo/5' : 'border-gris-mid hover:border-negro/30',
          uploading ? 'cursor-wait' : '',
        ].join(' ')}
        style={{ minHeight: previewSrc ? 'auto' : '140px' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={e => upload(e.target.files?.[0])}
          disabled={uploading}
        />

        <AnimatePresence mode="wait">
          {previewSrc ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative group"
            >
              <img
                src={previewSrc}
                alt="Preview"
                className="w-full object-cover max-h-52"
              />
              <div className="absolute inset-0 bg-crema/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                <span className="font-ui text-[10px] text-negro uppercase tracking-[0.3em]">
                  Cambiar imagen
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-36 gap-3 px-4"
            >
              {uploading ? (
                <>
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="font-mono text-[11px] text-rojo"
                  >Subiendo…</motion.span>
                </>
              ) : (
                <>
                  <span className="font-mono text-3xl text-negro/50">+</span>
                  <span className="font-ui text-[10px] text-negro/50 uppercase tracking-[0.25em] text-center">
                    {dragging ? 'Soltar aquí' : 'Arrastrá o hacé clic · JPG PNG WebP · máx 5MB'}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {uploading && previewSrc && (
          <div className="absolute inset-0 bg-crema/60 flex items-center justify-center">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="font-mono text-[11px] text-rojo"
            >Subiendo…</motion.span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[10px] text-rojo"
          >{error}</motion.p>
        )}
      </AnimatePresence>

      {value && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onChange('') }}
          className="font-ui text-[9px] uppercase tracking-[0.2em] text-negro/50 hover:text-rojo transition-colors duration-150"
        >
          ✕ Quitar imagen
        </button>
      )}
    </div>
  )
}
