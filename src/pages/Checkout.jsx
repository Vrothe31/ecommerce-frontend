import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'RAZORPAY', label: 'Razorpay (UPI / Card)' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Credit / Debit Card' },
]

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore()
  const user = useAuthStore(s => s.user)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/addresses').then(res => {
      setAddresses(res.data)
      const def = res.data.find(a => a.isDefault)
      if (def) setAddressId(String(def.id))
    })
  }, [user, navigate])

  const handlePlaceOrder = async () => {
    if (!addressId && addresses.length === 0) {
      return toast.error('Please add a delivery address in Profile')
    }
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ productId: i.id, quantity: i.qty }))
      const res = await api.post('/orders', {
        items: orderItems,
        paymentMethod,
        addressId: addressId ? Number(addressId) : null,
        couponCode: couponCode || null,
      })
      const order = res.data

      if (paymentMethod === 'RAZORPAY' || paymentMethod === 'UPI' || paymentMethod === 'CARD') {
        const payRes = await api.post(`/payments/razorpay/create/${order.id}`)
        const payData = payRes.data

        if (payData.mockMode) {
          await api.post('/payments/razorpay/verify', {
            orderId: order.id,
            razorpayOrderId: payData.razorpayOrderId,
            razorpayPaymentId: 'mock_payment_' + order.id,
            razorpaySignature: 'mock_signature',
          })
          clearCart()
          navigate('/payment/success', { state: { orderId: order.id } })
        } else {
          const options = {
            key: payData.razorpayKeyId,
            amount: payData.amount * 100,
            currency: 'INR',
            order_id: payData.razorpayOrderId,
            handler: async (response) => {
              await api.post('/payments/razorpay/verify', {
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              clearCart()
              navigate('/payment/success', { state: { orderId: order.id } })
            },
          }
          const rzp = new window.Razorpay(options)
          rzp.on('payment.failed', () => navigate('/payment/failure'))
          rzp.open()
        }
      } else {
        clearCart()
        toast.success(`Order #${order.id} placed!`)
        navigate('/orders')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 dark:text-white">Delivery Address</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-400">No addresses. <a href="/profile" className="text-blue-600">Add one in Profile</a></p>
        ) : (
          <div className="space-y-2">
            {addresses.map(a => (
              <label key={a.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer dark:border-gray-700 ${addressId === String(a.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <input type="radio" name="address" value={a.id} checked={addressId === String(a.id)}
                  onChange={() => setAddressId(String(a.id))} />
                <div className="text-sm dark:text-gray-300">
                  <p className="font-medium">{a.name} · {a.phone}</p>
                  <p>{a.addressLine}, {a.city}, {a.state} - {a.pincode}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 dark:text-white">Payment Method</h2>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(m => (
            <label key={m.value} className={`p-3 border rounded-lg cursor-pointer text-sm dark:border-gray-700 ${paymentMethod === m.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value}
                onChange={() => setPaymentMethod(m.value)} className="mr-2" />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 dark:text-white">Coupon Code</h2>
        <input type="text" placeholder="e.g. WELCOME10" value={couponCode}
          onChange={e => setCouponCode(e.target.value.toUpperCase())}
          className="border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-4 py-2 w-full" />
        <p className="text-xs text-gray-400 mt-1">Try: WELCOME10 or FLAT100</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 dark:text-white">Order Summary</h2>
        {items.map(item => (
          <div key={item.id} className="flex justify-between py-2 border-b dark:border-gray-700 last:border-0 text-sm dark:text-gray-300">
            <span>{item.name} × {item.qty}</span>
            <span>₹{(Number(item.price) * item.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-bold text-lg dark:text-white">
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
