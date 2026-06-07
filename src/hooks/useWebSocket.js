import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const WS_URL = 'http://localhost:8080/ws'

export function useWebSocket(onStockUpdate) {
  const clientRef = useRef(null)
  const user = useAuthStore(s => s.user)

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
          })
        }

        if (user?.role === 'ADMIN') {
          client.subscribe('/topic/orders/admin', (msg) => {
            const data = JSON.parse(msg.body)
            toast(`📦 ${data.message}`, { icon: '🔔' })
          })
        }
      },
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [user?.id, user?.role, onStockUpdate])
}
