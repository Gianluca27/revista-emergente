const UPLOAD_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

export function resolveImageUrl(url) {
  if (!url) return null
  if (typeof url !== 'string') return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/')) return UPLOAD_BASE + url
  return url
}

export const UPLOAD_URL = UPLOAD_BASE
