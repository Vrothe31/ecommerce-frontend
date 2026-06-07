import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

// Accepts either a single function (treated as onStockUpdate for backward
// compatibility) or an options object { onStockUpdate, onOrderUpdate }.
export function useWebSocket(handlers) {
  const user = useAuthStore(s => s.user)
  const onStockUpdate = typeof handlers === 'function' ? handlers : handlers?.onStockUpdate
  const onOrderUpdate = typeof handlers === 'function' ? undefined : handlers?.onOrderUpdate

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/stock', (msg) => {
          const data = JSON.parse(msg.body)
          onStockUpdate?.(data)
        })

        if (user?.id) {
          client.subscribe(`/topic/orders/${user.id}`, (msg) => {
            const data = JSON.parse(msg.body)
            toast.success(data.message || `Order #${data.orderId} → ${data.status}`)
            onOrderUpdate?.(data)
          })
        }

        if (user?.role === 'ADMIN') {
          client.subscribe('/topic/orders/admin', (msg) => {
            const data = JSON.parse(msg.body)
            toast(`📦 ${data.message}`, { icon: '🔔' })
            onOrderUpdate?.(data)
          })
        }
      },
    })

    client.activate()

    return () => client.deactivate()
  }, [user?.id, user?.role, onStockUpdate, onOrderUpdate])
}
