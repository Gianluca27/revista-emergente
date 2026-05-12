import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/entrevistas', label: 'Entrevistas' },
  { to: '/shows', label: 'Shows' },
  { to: '/sobre-nosotros', label: 'Sobre Nosotras' },
  { to: '/contacto', label: 'Contacto' },
]

const SOCIAL_LINKS = [
  { href: '#', label: 'Instagram' },
  { href: '#', label: 'Twitter / X' },
  { href: '#', label: 'Spotify' },
]

export default function Footer() {
  return (
    <footer className="bg-crema border-t-2 border-rojo mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="font-grunge text-5xl text-rojo uppercase leading-none mb-3">
              EMERGENTE
            </p>
            <p className="font-mono text-base text-negro/90 leading-relaxed max-w-xs">
              Cobertura independiente de la escena musical argentina. Entrevistas y shows desde adentro.
            </p>
          </div>

          <div>
            <p className="font-ui text-base uppercase tracking-widest text-negro/90 mb-4 border-b border-gris-mid pb-2">
              Secciones
            </p>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-ui text-lg text-negro hover:text-rojo transition-colors duration-150 uppercase tracking-wide"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-ui text-base uppercase tracking-widest text-negro/90 mb-4 border-b border-gris-mid pb-2">
              Redes
            </p>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-ui text-lg text-negro hover:text-rojo transition-colors duration-150 uppercase tracking-wide"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gris-mid pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-mono text-base text-negro/90">
            © {new Date().getFullYear()} Revista Emergente — Todos los derechos reservados
          </p>
          <p className="font-mono text-base text-negro/90 uppercase tracking-widest">
            revistaemergente.ar
          </p>
        </div>
      </div>
    </footer>
  )
}
