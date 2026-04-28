import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from './ImageUploader'
import GalleryUploader from './GalleryUploader'

const schema = z.object({
  title:       z.string().min(1, 'El título es requerido'),
  venue:       z.string().optional(),
  event_date:  z.string().optional(),
  description: z.string().optional(),
  cover_image: z.string().optional(),
  status:      z.enum(['draft', 'published']),
})

const INPUT_CLS = 'w-full bg-crema text-negro font-mono text-sm px-3 py-2.5 border border-gris-mid focus:outline-none focus:border-rojo/60 transition-colors duration-150 placeholder-gris-mid'
const INPUT_ERR = 'border-rojo'

function FieldLabel({ children, required }) {
  return (
    <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-negro/90 mb-1.5">
      {children}{required && <span className="text-rojo ml-0.5">*</span>}
    </label>
  )
}
function FieldError({ message }) {
  return message ? <p className="font-mono text-[10px] text-rojo mt-1">{message}</p> : null
}

export default function ShowForm({ initialData, onSubmit, onDelete, saving }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [gallery, setGallery] = useState(
    Array.isArray(initialData?.gallery) ? initialData.gallery : []
  )

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       initialData?.title       ?? '',
      venue:       initialData?.venue       ?? '',
      event_date:  initialData?.event_date  ? initialData.event_date.slice(0, 10) : '',
      description: initialData?.description ?? '',
      cover_image: initialData?.cover_image ?? '',
      status:      initialData?.status      ?? 'draft',
    },
  })

  function buildPayload(data) {
    return {
      title:       data.title,
      venue:       data.venue || null,
      event_date:  data.event_date || null,
      description: data.description || null,
      cover_image: data.cover_image || null,
      status:      data.status,
      gallery,
    }
  }

  const submit = handleSubmit(data => onSubmit(buildPayload(data)))

  return (
    <form onSubmit={submit} className="space-y-7">

      {initialData && (
        <div className="flex items-center gap-3">
          <span className={[
            'inline-block font-ui text-[9px] uppercase tracking-[0.3em] px-2 py-1 border',
            initialData.status === 'published' ? 'border-rojo text-rojo bg-rojo/10' : 'border-gris-mid text-negro/90',
          ].join(' ')}>
            {initialData.status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
        </div>
      )}

      <div>
        <FieldLabel required>Título</FieldLabel>
        <input
          {...register('title')}
          placeholder="Festival X"
          className={`${INPUT_CLS} font-display text-xl tracking-wide ${errors.title ? INPUT_ERR : ''}`}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Venue / Locación</FieldLabel>
          <input
            {...register('venue')}
            placeholder="Centro Cultural X"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <FieldLabel>Fecha del evento</FieldLabel>
          <input
            type="date"
            {...register('event_date')}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <Controller
        name="cover_image"
        control={control}
        render={({ field }) => (
          <ImageUploader value={field.value} onChange={field.onChange} label="Portada" />
        )}
      />

      <div>
        <FieldLabel>Crónica / Descripción</FieldLabel>
        <textarea
          {...register('description')}
          placeholder="Texto de la cobertura: cómo fue, qué pasó, qué se vio…"
          rows={6}
          className={`${INPUT_CLS} resize-y leading-relaxed`}
        />
      </div>

      <GalleryUploader value={gallery} onChange={setGallery} label="Galería de fotos" />

      <div>
        <FieldLabel>Estado</FieldLabel>
        <select {...register('status')} className={`${INPUT_CLS} max-w-xs`}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gris-mid">
        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150 disabled:opacity-40"
        >
          {saving ? 'Guardando…' : initialData ? 'Actualizar' : 'Crear'}
        </motion.button>

        {onDelete && (
          <div className="ml-auto">
            <AnimatePresence mode="wait">
              {!confirmDelete ? (
                <motion.button
                  key="del"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="font-ui text-[10px] uppercase tracking-[0.2em] text-negro/90 hover:text-rojo transition-colors duration-150"
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
                  <button type="button" onClick={onDelete}
                    className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 bg-rojo text-crema">
                    Sí, eliminar
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    className="font-mono text-[10px] text-negro/90 hover:text-negro">
                    No
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </form>
  )
}
