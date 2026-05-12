import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from './ImageUploader'

const schema = z.object({
  name:  z.string().min(1, 'El nombre es requerido'),
  role:  z.string().optional(),
  bio:   z.string().optional(),
  photo: z.string().optional(),
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

export default function TeamMemberForm({ initialData, onSubmit, onDelete, saving }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:  initialData?.name  ?? '',
      role:  initialData?.role  ?? '',
      bio:   initialData?.bio   ?? '',
      photo: initialData?.photo ?? '',
    },
  })

  function buildPayload(data) {
    return {
      name:  data.name,
      role:  data.role  || null,
      bio:   data.bio   || null,
      photo: data.photo || null,
    }
  }

  const submit = handleSubmit(data => onSubmit(buildPayload(data)))

  return (
    <form onSubmit={submit} className="space-y-7">
      {/* Nombre */}
      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <input
          {...register('name')}
          placeholder="Nombre y apellido"
          className={`${INPUT_CLS} font-display text-xl tracking-wide ${errors.name ? INPUT_ERR : ''}`}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Foto */}
      <Controller
        name="photo"
        control={control}
        render={({ field }) => (
          <ImageUploader value={field.value} onChange={field.onChange} label="Foto" />
        )}
      />

      {/* Rol */}
      <div>
        <FieldLabel>Rol</FieldLabel>
        <input
          {...register('role')}
          placeholder="Ej: Directora & Editora"
          className={INPUT_CLS}
        />
      </div>

      {/* Bio */}
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea
          {...register('bio')}
          placeholder="Una línea sobre la persona"
          rows={4}
          className={`${INPUT_CLS} resize-y leading-relaxed`}
        />
      </div>

      {/* Acciones */}
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
                  <button
                    type="button"
                    onClick={onDelete}
                    className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 bg-rojo text-crema"
                  >Sí, eliminar</button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="font-mono text-[10px] text-negro/90 hover:text-negro"
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
