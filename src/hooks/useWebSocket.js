import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

export function useWebSocket(onStockUpdate, onOrderUpdate, onNotification) {
  const user = useAuthStore(s => s.user)
  const callbacks = useRef({ onStockUpdate, onOrderUpdate, onNotification })
  callbacks.current = { onStockUpdate, onOrderUpdate, onNotification }

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/stock', (msg) => {
          const data = JSON.parse(msg.body)
          callbacks.current.onStockUpdate?.(data)
        })

        if (user) {
          client.subscribe(`/topic/orders/${user.id}`, (msg) => {
            const data = JSON.parse(msg.body)
            toast(data.message || `Order #${data.orderId} updated`)
            callbacks.current.onOrderUpdate?.(data)
          })

          client.subscribe('/topic/notifications/' + user.id, (msg) => {
            const data = JSON.parse(msg.body)
            toast(data.title + ': ' + data.message)
            callbacks.current.onNotification?.(data)
          })

          if (user.role === 'ADMIN') {
            client.subscribe('/topic/orders/admin', (msg) => {
              const data = JSON.parse(msg.body)
              toast(`[Admin] ${data.message}`)
              callbacks.current.onOrderUpdate?.(data)
            })
          }
        }
      },
    })

    client.activate()
    return () => client.deactivate()
  }, [user?.id, user?.role])
}
