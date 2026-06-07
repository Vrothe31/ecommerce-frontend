import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useCartStore } from '../store/cartStore'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [liveStock, setLiveStock] = useState(null)
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data))
  }, [id])

  const onStockUpdate = useCallback((data) => {
    if (data.productId === Number(id)) setLiveStock(data.stock)
  }, [id])

  useWebSocket(onStockUpdate)

  if (!product) return <p className="text-center py-20 text-gray-400">Loading...</p>

  const stock = liveStock ?? product.stock

  const handleAdd = () => {
    if (qty > stock) return toast.error('Not enough stock!')
    for (let i = 0; i < qty; i++) addItem({ ...product, stock })
    toast.success(`Added ${qty} to cart!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <img src={product.imageUrl} alt={product.name}
          className="w-full rounded-2xl shadow-lg object-cover max-h-96" />
        <div>
          <p className="text-sm text-blue-600 font-medium mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            ₹{Number(product.price).toLocaleString()}
          </p>
          <p className={`text-sm mb-6 ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock > 0 ? `${stock} in stock (live)` : 'Out of stock'}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm text-gray-500">Qty:</label>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 border rounded-lg hover:bg-gray-50">−</button>
            <span className="font-semibold w-8 text-center">{qty}</span>
            <button onClick={() => setQty(q => Math.min(stock, q + 1))}
              className="w-8 h-8 border rounded-lg hover:bg-gray-50">+</button>
          </div>

          <button onClick={handleAdd} disabled={stock <= 0}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 w-full md:w-auto">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
