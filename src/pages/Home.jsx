import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useWebSocket } from '../hooks/useWebSocket'

export default function Home() {
  const [products, setProducts] = useState([])
  const [stockMap, setStockMap] = useState({})

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data.slice(0, 4)))
  }, [])

  const onStockUpdate = useCallback((data) => {
    setStockMap(prev => ({ ...prev, [data.productId]: data.stock }))
  }, [])

  useWebSocket(onStockUpdate)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-10 mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">Welcome to ShopZone</h1>
        <p className="text-blue-100 mb-2">Real-time stock updates • Secure checkout • Fast delivery</p>
        <p className="text-blue-200 text-sm mb-6">Electronics, Fashion, Furniture & more!</p>
        <Link to="/products"
          className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition inline-block">
          Shop Now
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Stock
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} liveStock={stockMap[p.id]} />
        ))}
      </div>
    </div>
  )
}
