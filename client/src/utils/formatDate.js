export function formatDate(dateString, options = {}) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

export function formatDateShort(dateString) {
  return formatDate(dateString, { month: 'short' })
}
