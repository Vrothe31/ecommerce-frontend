import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  pincode: '',
}

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const navigate = useNavigate()

  const setField = (field) => (e) =>
    setAddress(prev => ({ ...prev, [field]: e.target.value }))

  const isValid = Object.values(address).every(v => v.trim() !== '')

  const handlePlaceOrder = async () => {
    if (!isValid) {
      toast.error('Please fill in the full delivery address')
      return
    }
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ productId: i.id, quantity: i.qty }))
      const res = await api.post('/orders', { items: orderItems, deliveryAddress: address })
      clearCart()
      toast.success(`Order #${res.data.id} placed!`)
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Delivery Address</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input value={address.fullName} onChange={setField('fullName')}
            placeholder="Full name"
            className="border rounded-lg px-3 py-2 text-sm" />
          <input value={address.phone} onChange={setField('phone')}
            placeholder="Phone number"
            className="border rounded-lg px-3 py-2 text-sm" />
          <input value={address.line1} onChange={setField('line1')}
            placeholder="Address (house no, street, area)"
            className="border rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <input value={address.city} onChange={setField('city')}
            placeholder="City"
            className="border rounded-lg px-3 py-2 text-sm" />
          <input value={address.state} onChange={setField('state')}
            placeholder="State"
            className="border rounded-lg px-3 py-2 text-sm" />
          <input value={address.pincode} onChange={setField('pincode')}
            placeholder="Pincode"
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

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
