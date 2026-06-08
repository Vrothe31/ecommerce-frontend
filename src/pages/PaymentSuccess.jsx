import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PaymentSuccess() {
  const { state } = useLocation()

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Payment Successful!</h1>
      <p className="text-gray-400 mb-8">Your order has been confirmed and is being processed.</p>
      {state?.orderId && (
        <Link to={`/orders/${state.orderId}`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-3">
          View Order
        </Link>
      )}
      <Link to="/products" className="inline-block border dark:border-gray-700 px-6 py-3 rounded-lg dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
        Continue Shopping
      </Link>
    </div>
  )
}
