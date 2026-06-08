import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [liveStock, setLiveStock] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const addItem = useCartStore(s => s.addItem)
  const user = useAuthStore(s => s.user)

  const fetchProduct = () => {
    api.get(`/products/${id}`).then(res => setProduct(res.data))
    api.get(`/products/${id}/reviews`).then(res => setReviews(res.data))
  }

  useEffect(() => { fetchProduct() }, [id])

  useWebSocket((data) => {
    if (data.productId === Number(id)) setLiveStock(data.stock)
  })

  const stock = liveStock ?? product?.stock

  const handleAdd = () => {
    if (stock <= 0) return toast.error('Out of stock')
    addItem({ ...product, qty })
    toast.success('Added to cart')
  }

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please login first')
    try {
      await api.post(`/wishlist/${id}`)
      toast.success('Added to wishlist')
    } catch {
      toast.error('Already in wishlist or failed')
    }
  }

  const submitReview = async () => {
    if (!user) return toast.error('Please login first')
    try {
      await api.post(`/products/${id}/reviews`, reviewForm)
      toast.success('Review submitted')
      setReviewForm({ rating: 5, comment: '' })
      fetchProduct()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Review failed')
    }
  }

  if (!product) return <p className="text-center py-20 text-gray-400">Loading...</p>

  const images = product.images?.length > 0 ? product.images : [product.imageUrl]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <img src={images[0]} alt={product.name}
            className="w-full aspect-square object-cover rounded-2xl bg-gray-100 dark:bg-gray-800" />
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700" />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold dark:text-white">{product.name}</h1>
          {product.brand && <p className="text-gray-400 mt-1">{product.brand}</p>}
          {product.averageRating > 0 && (
            <p className="text-yellow-500 mt-2">★ {product.averageRating} ({product.reviewCount} reviews)</p>
          )}
          <p className="text-3xl font-bold text-blue-600 mt-4">₹{Number(product.price).toLocaleString()}</p>
          <p className={`text-sm mt-2 ${stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border dark:border-gray-700 rounded-lg">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 dark:text-white">−</button>
              <span className="px-4 py-2 dark:text-white">{qty}</span>
              <button onClick={() => setQty(q => Math.min(stock, q + 1))} className="px-4 py-2 dark:text-white">+</button>
            </div>
            <button onClick={handleAdd} disabled={stock === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">
              Add to Cart
            </button>
            <button onClick={toggleWishlist}
              className="p-3 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
              ♡
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 dark:text-white">Reviews ({reviews.length})</h2>
        {user && (
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                  className={`text-2xl ${n <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
            <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Write your review..." rows={3}
              className="w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2 mb-3" />
            <button onClick={submitReview} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">Submit Review</button>
          </div>
        )}
        {reviews.map(r => (
          <div key={r.id} className="border-b dark:border-gray-700 py-4">
            <div className="flex items-center gap-2">
              <span className="font-medium dark:text-white">{r.userName}</span>
              <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
