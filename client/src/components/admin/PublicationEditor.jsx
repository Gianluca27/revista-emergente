import { useEffect, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import TipTapEditor from './TipTapEditor'
import ImageUploader from './ImageUploader'
import api from '../../services/api'

const schema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  subtitle: z.string().optional(),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  category_id: z.coerce.number().min(1, 'Seleccioná una categoría'),
  cover_image: z.string().optional(),
  body: z.string().optional(),
  published_at: z.string().optional(),
})

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function FieldLabel({ children, required }) {
  return (
    <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-negro/50 mb-1.5">
      {children}{required && <span className="text-rojo ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }) {
  return message ? (
    <p className="font-mono text-[10px] text-rojo mt-1">{message}</p>
  ) : null
}

const INPUT_CLS = 'w-full bg-crema text-negro font-mono text-sm px-3 py-2.5 border border-gris-mid focus:outline-none focus:border-rojo/60 transition-colors duration-150 placeholder-gris-mid'
const INPUT_ERR = 'border-rojo'

export default function PublicationEditor({ initialData, onSaveDraft, onPublish, onUnpublish, onDelete, saving, publishing }) {
  const [categories, setCategories] = useState([])
  const [artists, setArtists] = useState([])
  const [selectedArtists, setSelectedArtists] = useState(initialData?.artists?.map(a => a.id) ?? [])
  const [slugEdited, setSlugEdited] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isPublished = initialData?.status === 'published'

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? '',
      subtitle: initialData?.subtitle ?? '',
      slug: initialData?.slug ?? '',
      category_id: initialData?.category?.id ?? '',
      cover_image: initialData?.cover_image ?? '',
      body: initialData?.body ?? '',
      published_at: initialData?.published_at
        ? initialData.published_at.slice(0, 16)
        : '',
    },
  })

  const titleValue = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && titleValue) {
      setValue('slug', slugify(titleValue))
    }
  }, [titleValue, slugEdited, setValue])

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    api.get('/artists').then(r => setArtists(r.data)).catch(() => {})
  }, [])

  function toggleArtist(id) {
    setSelectedArtists(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function buildPayload(data) {
    return {
      ...data,
      category_id: Number(data.category_id),
      artist_ids: selectedArtists,
      published_at: data.published_at || null,
      subtitle: data.subtitle || null,
      cover_image: data.cover_image || null,
      body: data.body || null,
    }
  }

  const handleDraft = handleSubmit(data => onSaveDraft(buildPayload(data)))
  const handlePublish = handleSubmit(data => onPublish(buildPayload(data)))

  return (
    <form className="space-y-8">

      {/* Status badge */}
      {initialData && (
        <div className="flex items-center gap-3">
          <span className={[
            'inline-block font-ui text-[9px] uppercase tracking-[0.3em] px-2 py-1 border',
            isPublished
              ? 'border-rojo text-rojo bg-rojo/10'
              : 'border-gris-mid text-negro/50',
          ].join(' ')}>
            {isPublished ? 'Publicada' : 'Borrador'}
          </span>
          {initialData.published_at && (
            <span className="font-mono text-[10px] text-negro/50">
              {new Date(initialData.published_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <FieldLabel required>Título</FieldLabel>
        <input
          {...register('title')}
          placeholder="Título de la entrevista"
          className={`${INPUT_CLS} font-display text-xl tracking-wide ${errors.title ? INPUT_ERR : ''}`}
        />
        <FieldError message={errors.title?.message} />
      </div>

      {/* Slug */}
      <div>
        <FieldLabel>Slug (URL)</FieldLabel>
        <div className="flex items-stretch gap-0">
          <span className="flex items-center px-3 bg-gris border border-r-0 border-gris-mid font-mono text-[11px] text-negro/50 shrink-0">
            /entrevistas/
          </span>
          <input
            {...register('slug')}
            placeholder="slug-generado"
            onChange={e => { setSlugEdited(true); register('slug').onChange(e) }}
            className={`${INPUT_CLS} flex-1 rounded-none ${errors.slug ? INPUT_ERR : ''}`}
          />
        </div>
        <FieldError message={errors.slug?.message} />
      </div>

      {/* Subtitle */}
      <div>
        <FieldLabel>Subtítulo</FieldLabel>
        <input
          {...register('subtitle')}
          placeholder="Subtítulo opcional"
          className={INPUT_CLS}
        />
      </div>

      {/* Category + Published at — 2 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <FieldLabel required>Categoría</FieldLabel>
          <select
            {...register('category_id')}
            className={`${INPUT_CLS} ${errors.category_id ? INPUT_ERR : ''}`}
          >
            <option value="">— Seleccioná —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError message={errors.category_id?.message} />
        </div>

        <div>
          <FieldLabel>Fecha de publicación</FieldLabel>
          <input
            type="datetime-local"
            {...register('published_at')}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* Cover image */}
      <Controller
        name="cover_image"
        control={control}
        render={({ field }) => (
          <ImageUploader
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {/* Artists */}
      <div>
        <FieldLabel>Artistas</FieldLabel>
        {artists.length === 0 ? (
          <p className="font-mono text-[11px] text-negro/50">No hay artistas cargados</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {artists.map(a => {
              const active = selectedArtists.includes(a.id)
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleArtist(a.id)}
                  className={[
                    'flex items-center gap-2 px-3 py-1.5 border font-ui text-[10px] uppercase tracking-[0.15em] transition-colors duration-150',
                    active
                      ? 'border-rojo text-rojo bg-rojo/10'
                      : 'border-gris-mid text-negro/50 hover:border-negro/40 hover:text-negro',
                  ].join(' ')}
                >
                  {a.photo && (
                    <img
                      src={a.photo.startsWith('http') ? a.photo : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${a.photo}`}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  {a.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div>
        <FieldLabel>Contenido</FieldLabel>
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <TipTapEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gris-mid">
        <motion.button
          type="button"
          onClick={handleDraft}
          disabled={saving || publishing}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 border border-gris-mid font-ui text-[11px] uppercase tracking-[0.25em] text-negro/50 hover:border-negro hover:text-negro transition-colors duration-150 disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar borrador'}
        </motion.button>

        {!isPublished ? (
          <motion.button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            whileHover={{ backgroundColor: '#7A0F14' }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema transition-colors duration-200 disabled:opacity-40"
          >
            {publishing ? 'Publicando…' : 'Publicar'}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={onUnpublish}
            disabled={saving || publishing}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 border border-rojo/50 font-ui text-[11px] uppercase tracking-[0.25em] text-rojo hover:bg-rojo/10 transition-colors duration-150 disabled:opacity-40"
          >
            {publishing ? '…' : 'Despublicar'}
          </motion.button>
        )}

        {onDelete && (
          <div className="ml-auto">
            <AnimatePresence mode="wait">
              {!confirmDelete ? (
                <motion.button
                  key="del"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="font-ui text-[10px] uppercase tracking-[0.2em] text-negro/50 hover:text-rojo transition-colors duration-150"
                >
                  Eliminar
                </motion.button>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-rojo">¿Confirmar?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 bg-rojo text-crema"
                  >Sí, eliminar</button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="font-mono text-[10px] text-negro/50 hover:text-negro"
                  >No</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </form>
  )
}
