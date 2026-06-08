import { useEffect, useState } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const [products, setProducts] = useState([])

  const fetchWishlist = () => api.get('/wishlist').then(res => setProducts(res.data))

  useEffect(() => { fetchWishlist() }, [])

  const moveToCart = async (productId) => {
    await api.post(`/wishlist/${productId}/move-to-cart`)
    toast.success('Moved to cart')
    fetchWishlist()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">My Wishlist</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-20">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              <button onClick={() => moveToCart(p.id)}
                className="absolute top-2 right-2 bg-white dark:bg-gray-800 shadow px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50">
                Move to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
