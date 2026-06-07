import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useWebSocket } from '../hooks/useWebSocket'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stockMap, setStockMap] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    const params = {}
    if (search) params.search = search
    if (categoryId) params.categoryId = categoryId
    try {
      const res = await api.get('/products', { params })
      setProducts(res.data)
    } finally {
      setLoading(false)
    }
  }, [search, categoryId])

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const onStockUpdate = useCallback((data) => {
    setStockMap(prev => ({ ...prev, [data.productId]: data.stock }))
  }, [])

  useWebSocket(onStockUpdate)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-20">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No products found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} liveStock={stockMap[p.id]} />
          ))}
        </div>
      )}
    </div>
  )
}
