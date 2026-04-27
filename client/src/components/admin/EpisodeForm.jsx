import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from './ImageUploader'

const urlOrEmpty = z.union([z.string().url('URL inválida'), z.literal('')]).optional()

const schema = z.object({
  title:          z.string().min(1, 'El título es requerido'),
  description:    z.string().optional(),
  cover_image:    z.string().optional(),
  spotify_url:    urlOrEmpty,
  youtube_url:    urlOrEmpty,
  duration_min:   z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
  episode_number: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
  status:         z.enum(['draft', 'published']),
})

const INPUT_CLS = 'w-full bg-crema text-negro font-mono text-sm px-3 py-2.5 border border-gris-mid focus:outline-none focus:border-rojo/60 transition-colors duration-150 placeholder-gris-mid'
const INPUT_ERR = 'border-rojo'

function FieldLabel({ children, required }) {
  return (
    <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-negro/50 mb-1.5">
      {children}{required && <span className="text-rojo ml-0.5">*</span>}
    </label>
  )
}
function FieldError({ message }) {
  return message ? <p className="font-mono text-[10px] text-rojo mt-1">{message}</p> : null
}

export default function EpisodeForm({ initialData, onSubmit, onDelete, saving }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:          initialData?.title          ?? '',
      description:    initialData?.description    ?? '',
      cover_image:    initialData?.cover_image    ?? '',
      spotify_url:    initialData?.spotify_url    ?? '',
      youtube_url:    initialData?.youtube_url    ?? '',
      duration_min:   initialData?.duration_min   ?? '',
      episode_number: initialData?.episode_number ?? '',
      status:         initialData?.status         ?? 'draft',
    },
  })

  function buildPayload(data) {
    return {
      title:          data.title,
      description:    data.description || null,
      cover_image:    data.cover_image || null,
      spotify_url:    data.spotify_url || null,
      youtube_url:    data.youtube_url || null,
      duration_min:   data.duration_min === '' ? null : Number(data.duration_min),
      episode_number: data.episode_number === '' ? null : Number(data.episode_number),
      status:         data.status,
    }
  }

  const submit = handleSubmit(data => onSubmit(buildPayload(data)))

  return (
    <form onSubmit={submit} className="space-y-7">

      {/* Status badge */}
      {initialData && (
        <div className="flex items-center gap-3">
          <span className={[
            'inline-block font-ui text-[9px] uppercase tracking-[0.3em] px-2 py-1 border',
            initialData.status === 'published' ? 'border-rojo text-rojo bg-rojo/10' : 'border-gris-mid text-negro/50',
          ].join(' ')}>
            {initialData.status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4">
        <div>
          <FieldLabel>N° episodio</FieldLabel>
          <input
            type="number"
            min="1"
            {...register('episode_number')}
            placeholder="01"
            className={`${INPUT_CLS} font-display text-2xl text-center ${errors.episode_number ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.episode_number?.message} />
        </div>
        <div>
          <FieldLabel required>Título</FieldLabel>
          <input
            {...register('title')}
            placeholder="Episodio X — Título"
            className={`${INPUT_CLS} font-display text-xl tracking-wide ${errors.title ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.title?.message} />
        </div>
      </div>

      {/* Cover */}
      <Controller
        name="cover_image"
        control={control}
        render={({ field }) => (
          <ImageUploader value={field.value} onChange={field.onChange} label="Portada del episodio" />
        )}
      />

      {/* Description */}
      <div>
        <FieldLabel>Descripción</FieldLabel>
        <textarea
          {...register('description')}
          placeholder="Resumen del episodio, invitados, temas tratados…"
          rows={5}
          className={`${INPUT_CLS} resize-y leading-relaxed`}
        />
      </div>

      {/* Duration + status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Duración (minutos)</FieldLabel>
          <input
            type="number"
            min="1"
            {...register('duration_min')}
            placeholder="45"
            className={`${INPUT_CLS} ${errors.duration_min ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.duration_min?.message} />
        </div>
        <div>
          <FieldLabel>Estado</FieldLabel>
          <select {...register('status')} className={INPUT_CLS}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Spotify</FieldLabel>
          <input
            {...register('spotify_url')}
            placeholder="https://open.spotify.com/episode/…"
            className={`${INPUT_CLS} ${errors.spotify_url ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.spotify_url?.message} />
        </div>
        <div>
          <FieldLabel>YouTube</FieldLabel>
          <input
            {...register('youtube_url')}
            placeholder="https://youtube.com/watch?v=…"
            className={`${INPUT_CLS} ${errors.youtube_url ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.youtube_url?.message} />
        </div>
      </div>

      {/* Actions */}
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
                  <button type="button" onClick={onDelete}
                    className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 bg-rojo text-crema">
                    Sí, eliminar
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    className="font-mono text-[10px] text-negro/50 hover:text-negro">
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
