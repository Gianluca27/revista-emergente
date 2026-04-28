import { motion, AnimatePresence } from 'framer-motion'

function formatFullDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return d }
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  read: 'Leído',
  archived: 'Archivado',
}

export default function ContactDrawer({ contact, onClose, onUpdateStatus, updating }) {
  const open = Boolean(contact)

  const mailtoBody = contact
    ? `Hola ${contact.name},%0D%0A%0D%0AGracias por escribirnos a Revista Emergente.%0D%0A%0D%0A`
    : ''
  const mailtoLink = contact
    ? `mailto:${contact.email}?subject=Revista%20Emergente&body=${mailtoBody}`
    : '#'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-crema/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-gris border-l border-gris-mid flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gris-mid flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-ui text-[9px] uppercase tracking-[0.3em] text-negro/90 mb-1">Mensaje</p>
                <h2 className="font-display text-3xl text-negro tracking-wide leading-tight truncate">
                  {contact.name}
                </h2>
                <p className="font-mono text-[11px] text-negro/90 mt-1 truncate">{contact.email}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="font-mono text-lg text-negro/90 hover:text-negro shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Status badge */}
            <div className="px-6 py-3 border-b border-gris-mid flex items-center gap-3">
              <span className={[
                'inline-block font-ui text-[9px] uppercase tracking-[0.3em] px-2 py-1 border',
                contact.status === 'pending'   ? 'border-rojo text-rojo bg-rojo/10' :
                contact.status === 'read'      ? 'border-negro/40 text-negro' :
                                                  'border-gris-mid text-negro/90',
              ].join(' ')}>
                {STATUS_LABELS[contact.status] ?? contact.status}
              </span>
              <span className="font-mono text-[10px] text-negro/90">
                {formatFullDate(contact.created_at)}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {contact.project_name && (
                <div>
                  <p className="font-ui text-[9px] uppercase tracking-[0.3em] text-negro/90 mb-1">Proyecto</p>
                  <p className="font-mono text-[12px] text-negro">{contact.project_name}</p>
                </div>
              )}

              {contact.instagram && (
                <div>
                  <p className="font-ui text-[9px] uppercase tracking-[0.3em] text-negro/90 mb-1">Instagram</p>
                  <p className="font-mono text-[12px] text-negro">{contact.instagram}</p>
                </div>
              )}

              <div>
                <p className="font-ui text-[9px] uppercase tracking-[0.3em] text-negro/90 mb-2">Mensaje</p>
                <p className="font-mono text-[12px] text-negro whitespace-pre-wrap leading-relaxed border-l-2 border-rojo pl-4">
                  {contact.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 border-t border-gris-mid space-y-3">
              <a
                href={mailtoLink}
                className="block text-center px-4 py-3 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150"
              >
                ✉ Responder por email
              </a>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateStatus('pending')}
                  disabled={updating || contact.status === 'pending'}
                  className={[
                    'px-2 py-2 border font-ui text-[9px] uppercase tracking-[0.2em] transition-colors duration-150',
                    contact.status === 'pending'
                      ? 'border-rojo text-rojo bg-rojo/10 cursor-default'
                      : 'border-gris-mid text-negro/90 hover:border-negro/40 hover:text-negro',
                    updating ? 'opacity-40 cursor-wait' : '',
                  ].join(' ')}
                >
                  Pendiente
                </button>
                <button
                  onClick={() => onUpdateStatus('read')}
                  disabled={updating || contact.status === 'read'}
                  className={[
                    'px-2 py-2 border font-ui text-[9px] uppercase tracking-[0.2em] transition-colors duration-150',
                    contact.status === 'read'
                      ? 'border-negro text-negro bg-crema/10 cursor-default'
                      : 'border-gris-mid text-negro/90 hover:border-negro/40 hover:text-negro',
                    updating ? 'opacity-40 cursor-wait' : '',
                  ].join(' ')}
                >
                  Marcar leído
                </button>
                <button
                  onClick={() => onUpdateStatus('archived')}
                  disabled={updating || contact.status === 'archived'}
                  className={[
                    'px-2 py-2 border font-ui text-[9px] uppercase tracking-[0.2em] transition-colors duration-150',
                    contact.status === 'archived'
                      ? 'border-gris-mid text-negro/90 bg-gris-mid/20 cursor-default'
                      : 'border-gris-mid text-negro/90 hover:border-negro/40 hover:text-negro',
                    updating ? 'opacity-40 cursor-wait' : '',
                  ].join(' ')}
                >
                  Archivar
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
