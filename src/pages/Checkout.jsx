import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ productId: i.id, quantity: i.qty }))
      const res = await api.post('/orders', { items: orderItems })
      clearCart()
      toast.success(`Order #${res.data.id} placed!`)
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        {items.map(item => (
          <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
            <span>{item.name} × {item.qty}</span>
            <span>₹{(Number(item.price) * item.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-bold text-lg">
          <span>Total</span>
          <span className="text-blue-600">₹{getTotal().toLocaleString()}</span>
        </div>
      </div>

      <button onClick={handlePlaceOrder} disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  )
}
