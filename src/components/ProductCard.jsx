import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product, liveStock }) {
  const addItem = useCartStore(s => s.addItem)
  const stock = liveStock ?? product.stock

  const handleAdd = (e) => {
    e.preventDefault()
    if (stock <= 0) return toast.error('Out of stock')
    addItem(product)
    toast.success('Added to cart')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover" loading="lazy" />
          {stock <= 5 && stock > 0 && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              Only {stock} left
            </span>
          )}
          {stock === 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
          {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-blue-600">₹{Number(product.price).toLocaleString()}</span>
            {product.averageRating > 0 && (
              <span className="text-xs text-yellow-500">★ {product.averageRating}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button onClick={handleAdd} disabled={stock === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
