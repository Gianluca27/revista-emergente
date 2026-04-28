export default function Badge({ children, variant = 'rojo' }) {
  const variants = {
    rojo: 'bg-rojo text-crema',
    outline: 'border border-rojo text-rojo bg-transparent',
    dark: 'bg-crema text-negro/90 border border-gris-mid',
  }

  return (
    <span className={`inline-block font-ui text-base uppercase tracking-widest px-2 py-0.5 ${variants[variant]}`}>
      {children}
    </span>
  )
}
