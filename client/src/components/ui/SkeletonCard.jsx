export default function SkeletonCard() {
  return (
    <div className="bg-gris border border-gris-mid overflow-hidden animate-pulse">
      <div className="aspect-[3/2] bg-negro" />
      <div className="p-4 border-t border-gris-mid">
        <div className="h-3 bg-gris-mid rounded w-1/4 mb-2" />
        <div className="h-5 bg-gris-mid rounded w-3/4 mb-1" />
        <div className="h-3 bg-gris-mid rounded w-1/2" />
      </div>
    </div>
  )
}
