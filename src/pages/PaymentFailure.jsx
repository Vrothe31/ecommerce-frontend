import { Link } from 'react-router-dom'

export default function PaymentFailure() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Payment Failed</h1>
      <p className="text-gray-400 mb-8">Something went wrong. Please try again.</p>
      <Link to="/cart" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-3">
        Back to Cart
      </Link>
      <Link to="/orders" className="inline-block border dark:border-gray-700 px-6 py-3 rounded-lg dark:text-white">
        My Orders
      </Link>
    </div>
  )
}
