import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product, liveStock }) {
  const addItem = useCartStore(s => s.addItem)
  const stock = liveStock ?? product.stock

  const handleAdd = (e) => {
    e.preventDefault()
    if (stock <= 0) return toast.error('Out of stock!')
    addItem({ ...product, stock })
    toast.success('Added to cart!')
  }

  return (
    <Link to={`/products/${product.id}`}
      className="border rounded-xl p-4 hover:shadow-lg transition bg-white flex flex-col">
      <img src={product.imageUrl} alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-3" />
      <p className="text-xs text-gray-400 mb-1">{product.category}</p>
      <h3 className="font-semibold text-gray-800 flex-1">{product.name}</h3>
      <div className="flex items-center justify-between mt-2">
        <p className="text-blue-600 font-bold">₹{Number(product.price).toLocaleString()}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          stock > 10 ? 'bg-green-100 text-green-700' :
          stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {stock > 0 ? `${stock} left` : 'Out of stock'}
        </span>
      </div>
      <button onClick={handleAdd}
        disabled={stock <= 0}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
        Add to Cart
      </button>
    </Link>
  )
}
