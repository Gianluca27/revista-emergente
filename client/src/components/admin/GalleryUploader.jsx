import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import api from '../../services/api'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

const MAX_SIZE = 5 * 1024 * 1024

function resolve(url) {
  return url.startsWith('http') ? url : UPLOAD_URL + url
}

export default function GalleryUploader({ value = [], onChange, label = 'Galería' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const uploadFiles = useCallback(async (files) => {
    if (!files || !files.length) return
    setError(null)
    const arr = Array.from(files)

    for (const file of arr) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`"${file.name}": tipo no permitido`)
        return
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}": excede 5MB`)
        return
      }
    }

    setUploading(true)
    setProgress({ current: 0, total: arr.length })
    const newUrls = []
    try {
      for (let i = 0; i < arr.length; i++) {
        setProgress({ current: i + 1, total: arr.length })
        const form = new FormData()
        form.append('image', arr[i])
        const res = await api.post('/admin/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        newUrls.push(res.data.url)
      }
      onChange([...value, ...newUrls])
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir')
    } finally {
      setUploading(false)
      setProgress({ current: 0, total: 0 })
    }
  }, [value, onChange])

  function removeAt(idx) {
    const next = value.filter((_, i) => i !== idx)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-negro/90">
          {label} {value.length > 0 && <span className="text-negro">({value.length})</span>}
        </label>
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="font-ui text-[10px] uppercase tracking-[0.2em] text-rojo hover:underline disabled:opacity-40"
        >
          + Agregar imágenes
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={e => uploadFiles(e.target.files)}
      />

      {value.length === 0 && !uploading && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-gris-mid p-8 text-center cursor-pointer hover:border-negro/40 transition-colors"
        >
          <p className="font-mono text-3xl text-negro/90 mb-2">+</p>
          <p className="font-ui text-[10px] text-negro/90 uppercase tracking-[0.25em]">
            Subir varias imágenes · JPG PNG WebP · máx 5MB c/u
          </p>
        </div>
      )}

      {value.length > 0 && (
        <Reorder.Group
          axis="y"
          values={value}
          onReorder={onChange}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        >
          {value.map((url, idx) => (
            <Reorder.Item
              key={url}
              value={url}
              className="relative group border border-gris-mid overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <img src={resolve(url)} alt="" className="w-full h-28 object-cover" />
              <div className="absolute top-1 left-1 bg-crema/70 px-1.5 py-0.5 font-mono text-[9px] text-negro">
                {idx + 1}
              </div>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 bg-negro/80 hover:bg-rojo text-crema font-mono text-[10px] w-5 h-5 flex items-center justify-center transition-colors"
                aria-label="Quitar"
              >
                ✕
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-rojo/40 bg-rojo/5 px-3 py-2 flex items-center gap-3"
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="font-mono text-[11px] text-rojo"
            >Subiendo {progress.current}/{progress.total}…</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

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

      {value.length > 0 && (
        <p className="font-mono text-[9px] text-negro/90">
          Arrastrá para reordenar · click ✕ para quitar
        </p>
      )}
    </div>
  )
}
