import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

export default function Cart() {
  const { items, removeItem, updateQty, getTotal, clearCart } = useCartStore()
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) return navigate('/login')
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
        <Link to="/products" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 border dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold dark:text-white">{item.name}</h3>
              <p className="text-blue-600 font-bold">₹{Number(item.price).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.id, item.qty - 1)}
                className="w-8 h-8 border dark:border-gray-600 rounded-lg dark:text-white">−</button>
              <span className="w-8 text-center dark:text-white">{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)}
                className="w-8 h-8 border dark:border-gray-600 rounded-lg dark:text-white">+</button>
            </div>
            <p className="font-bold w-24 text-right dark:text-white">
              ₹{(Number(item.price) * item.qty).toLocaleString()}
            </p>
            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-xl">×</button>
          </motion.div>
        ))}
      </div>

      <div className="border-t dark:border-gray-700 pt-6 flex items-center justify-between">
        <button onClick={clearCart} className="text-red-500 text-sm hover:underline">Clear Cart</button>
        <div className="text-right">
          <p className="text-2xl font-bold mb-4 dark:text-white">Total: ₹{getTotal().toLocaleString()}</p>
          <button onClick={handleCheckout}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
