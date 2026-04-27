export default function CategoryFilter({ categories = [], active = null, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`font-ui text-xs uppercase tracking-widest px-4 py-2 border transition-colors duration-150 ${
          active === null
            ? 'bg-rojo text-crema border-rojo'
            : 'bg-transparent text-negro/50 border-gris-mid hover:border-negro hover:text-negro'
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
                ? 'bg-rojo text-crema border-rojo'
                : 'bg-transparent text-negro/50 border-gris-mid hover:border-negro hover:text-negro'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
