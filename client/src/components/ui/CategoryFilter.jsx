export default function CategoryFilter({ categories = [], active = null, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`font-ui text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-150 ${
          active === null
            ? 'bg-rojo text-blanco border-rojo'
            : 'bg-transparent text-gris-mid border-gris-mid hover:border-blanco hover:text-blanco'
        }`}
      >
        Todas
      </button>
      {categories.map(cat => {
        const id = cat.id ?? cat
        const name = cat.name ?? cat
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`font-ui text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-150 ${
              active === id
                ? 'bg-rojo text-blanco border-rojo'
                : 'bg-transparent text-gris-mid border-gris-mid hover:border-blanco hover:text-blanco'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
