import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { PageSkeleton } from '../components/Skeleton'
import { useWebSocket } from '../hooks/useWebSocket'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [stockMap, setStockMap] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = { page, size: 12 }
    if (search) params.search = search
    if (categoryId) params.categoryId = categoryId
    if (brandId) params.brandId = brandId
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    if (minRating) params.minRating = minRating
    if (sortBy) params.sortBy = sortBy
    api.get('/products', { params })
      .then(res => {
        const data = res.data
        if (data.content) {
          setProducts(data.content)
          setTotalPages(data.totalPages)
        } else {
          setProducts(data)
          setTotalPages(1)
        }
      })
      .finally(() => setLoading(false))
  }, [search, categoryId, brandId, minPrice, maxPrice, minRating, sortBy, page])

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data))
    api.get('/brands').then(res => setBrands(res.data))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const onStockUpdate = useCallback((data) => {
    setStockMap(prev => ({ ...prev, [data.productId]: data.stock }))
  }, [])

  useWebSocket(onStockUpdate)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">All Products</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(0) }}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={brandId} onChange={e => { setBrandId(e.target.value); setPage(0) }}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={minRating} onChange={e => { setMinRating(e.target.value); setPage(0) }}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2">
          <option value="">All Ratings</option>
          <option value="4">4★ & above</option>
          <option value="3">3★ & above</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2">
          <option value="">Sort By</option>
          <option value="price">Price: Low to High</option>
          <option value="popularity">Popularity</option>
          <option value="rating">Rating</option>
        </select>
        <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 w-24" />
        <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 w-24" />
      </div>

      {loading ? <PageSkeleton /> : products.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No products found</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} liveStock={stockMap[p.id]} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-4 py-2 border dark:border-gray-700 rounded-lg disabled:opacity-50 dark:text-white">Prev</button>
              <span className="px-4 py-2 dark:text-white">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="px-4 py-2 border dark:border-gray-700 rounded-lg disabled:opacity-50 dark:text-white">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
