export default function Badge({ children, variant = 'rojo' }) {
  const variants = {
    rojo: 'bg-rojo text-blanco',
    outline: 'border border-rojo text-rojo bg-transparent',
    dark: 'bg-negro text-gris-mid border border-gris-mid',
  }

  return (
    <span className={`inline-block font-ui text-xs uppercase tracking-widest px-2 py-0.5 ${variants[variant]}`}>
      {children}
    </span>
  )
}
