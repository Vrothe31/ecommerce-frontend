export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2" />
      </div>
    </div>
  )
}

export function PageSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )
}
