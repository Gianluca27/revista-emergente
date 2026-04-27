import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from './ImageUploader'

const urlOrEmpty = z.union([z.string().url('URL inválida'), z.literal('')]).optional()

const schema = z.object({
  name:           z.string().min(1, 'El nombre es requerido'),
  bio:            z.string().optional(),
  photo:          z.string().optional(),
  instagram_url:  urlOrEmpty,
  spotify_url:    urlOrEmpty,
  youtube_url:    urlOrEmpty,
  soundcloud_url: urlOrEmpty,
})

const INPUT_CLS = 'w-full bg-negro text-blanco font-mono text-sm px-3 py-2.5 border border-gris-mid focus:outline-none focus:border-rojo/60 transition-colors duration-150 placeholder-gris-mid'
const INPUT_ERR = 'border-rojo'

function FieldLabel({ children, required }) {
  return (
    <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-gris-mid mb-1.5">
      {children}{required && <span className="text-rojo ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }) {
  return message ? <p className="font-mono text-[10px] text-rojo mt-1">{message}</p> : null
}

export default function ArtistForm({ initialData, onSubmit, onDelete, saving }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:           initialData?.name           ?? '',
      bio:            initialData?.bio            ?? '',
      photo:          initialData?.photo          ?? '',
      instagram_url:  initialData?.instagram_url  ?? '',
      spotify_url:    initialData?.spotify_url    ?? '',
      youtube_url:    initialData?.youtube_url    ?? '',
      soundcloud_url: initialData?.soundcloud_url ?? '',
    },
  })

  function buildPayload(data) {
    return {
      ...data,
      bio:            data.bio || null,
      photo:          data.photo || null,
      instagram_url:  data.instagram_url || null,
      spotify_url:    data.spotify_url || null,
      youtube_url:    data.youtube_url || null,
      soundcloud_url: data.soundcloud_url || null,
    }
  }

  const submit = handleSubmit(data => onSubmit(buildPayload(data)))

  return (
    <form onSubmit={submit} className="space-y-7">

      {/* Name */}
      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <input
          {...register('name')}
          placeholder="Nombre del artista"
          className={`${INPUT_CLS} font-display text-xl tracking-wide ${errors.name ? INPUT_ERR : ''}`}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Photo */}
      <Controller
        name="photo"
        control={control}
        render={({ field }) => (
          <ImageUploader
            value={field.value}
            onChange={field.onChange}
            label="Foto"
          />
        )}
      />

      {/* Bio */}
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea
          {...register('bio')}
          placeholder="Breve descripción del artista o proyecto"
          rows={5}
          className={`${INPUT_CLS} resize-y leading-relaxed`}
        />
      </div>

      {/* Social grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Instagram</FieldLabel>
          <input
            {...register('instagram_url')}
            placeholder="https://instagram.com/…"
            className={`${INPUT_CLS} ${errors.instagram_url ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.instagram_url?.message} />
        </div>
        <div>
          <FieldLabel>Spotify</FieldLabel>
          <input
            {...register('spotify_url')}
            placeholder="https://open.spotify.com/artist/…"
            className={`${INPUT_CLS} ${errors.spotify_url ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.spotify_url?.message} />
        </div>
        <div>
          <FieldLabel>YouTube</FieldLabel>
          <input
            {...register('youtube_url')}
            placeholder="https://youtube.com/…"
            className={`${INPUT_CLS} ${errors.youtube_url ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.youtube_url?.message} />
        </div>
        <div>
          <FieldLabel>SoundCloud</FieldLabel>
          <input
            {...register('soundcloud_url')}
            placeholder="https://soundcloud.com/…"
            className={`${INPUT_CLS} ${errors.soundcloud_url ? INPUT_ERR : ''}`}
          />
          <FieldError message={errors.soundcloud_url?.message} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gris-mid">
        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-blanco hover:bg-red-800 transition-colors duration-150 disabled:opacity-40"
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
                  className="font-ui text-[10px] uppercase tracking-[0.2em] text-gris-mid hover:text-rojo transition-colors duration-150"
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
                    className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 bg-rojo text-blanco"
                  >Sí, eliminar</button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="font-mono text-[10px] text-gris-mid hover:text-blanco"
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
