import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate'
import Badge from './Badge'

export default function PublicationCard({ title, subtitle, category, coverImage, slug, date }) {
  return (
    <Link
      to={`/entrevistas/${slug}`}
      className="group block bg-gris border border-gris-mid overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-[3/2]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-negro flex items-center justify-center">
            <span className="font-display text-7xl text-gris-mid">R</span>
          </div>
        )}
        <div className="absolute inset-0 bg-rojo opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        {category && (
          <div className="absolute top-3 left-3">
            <Badge>{category}</Badge>
          </div>
        )}
      </div>

      <div className="p-4 border-t-2 border-transparent group-hover:border-rojo transition-colors duration-200">
        {date && (
          <p className="font-ui text-xs text-gris-mid uppercase tracking-widest mb-1">
            {formatDate(date)}
          </p>
        )}
        <h3 className="font-display text-blanco text-xl leading-tight group-hover:text-rojo transition-colors duration-200 uppercase">
          {title}
        </h3>
        {subtitle && (
          <p className="font-mono text-xs text-gris-mid mt-1 line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}
