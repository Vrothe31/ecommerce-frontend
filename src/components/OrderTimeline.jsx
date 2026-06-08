const STEPS = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

const LABELS = {
  CONFIRMED: 'Order Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Delivered',
}

export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED' || status === 'RETURNED' || status === 'REFUNDED') {
    return <div className="text-sm text-red-500 font-medium">Status: {status}</div>
  }

  const currentIdx = status === 'PENDING' ? -1 : STEPS.indexOf(status)

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 ${
                done ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'
              } ${active ? 'ring-4 ring-blue-100 dark:ring-blue-900' : ''}`} />
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-8 ${done && i < currentIdx ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
            <div className={`pb-6 text-sm ${done ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
              {LABELS[step]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
