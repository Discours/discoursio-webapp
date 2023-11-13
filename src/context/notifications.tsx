import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createMemo, createSignal, onMount, useContext } from 'solid-js'
import { useSession } from './session'
import { Portal } from 'solid-js/web'
import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { createStore } from 'solid-js/store'
import { IDBPDatabase, openDB } from 'idb'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from '../graphql/privateGraphQLClient'
import { Author, Message, Reaction, Shout } from '../graphql/types.gen'

export interface SSEMessage {
  id: string
  entity: string
  action: string
  payload: any // Author | Shout | Reaction | Message
  timestamp?: number
  seen?: boolean
}

export type MessageHandler = (m: SSEMessage) => void

type NotificationsContextType = {
  notificationEntities: Record<number, SSEMessage>
  unreadNotificationsCount: Accessor<number>
  sortedNotifications: Accessor<SSEMessage[]>
  actions: {
    showNotificationsPanel: () => void
    hideNotificationsPanel: () => void
    markNotificationAsRead: (notification: SSEMessage) => Promise<void>
    setMessageHandler: (h: MessageHandler) => void
  }
}

const NotificationsContext = createContext<NotificationsContextType>()

export function useNotifications() {
  return useContext(NotificationsContext)
}

export const NotificationsProvider = (props: { children: JSX.Element }) => {
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = createSignal(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = createSignal(0)
  const { isAuthenticated, user } = useSession()
  const [notificationEntities, setNotificationEntities] = createStore<Record<number, SSEMessage>>({})
  const [db, setDb] = createSignal<Promise<IDBPDatabase<unknown>>>()
  onMount(() => {
    const dbx = openDB('notifications-db', 1, {
      upgrade(indexedDb) {
        indexedDb.createObjectStore('notifications')
      }
    })
    setDb(dbx)
  })

  const loadNotifications = async () => {
    const storage = await db()
    const notifications = await storage.getAll('notifications')
    console.log('[context.notifications] Loaded notifications:', notifications)

    const totalUnreadCount = notifications.filter((notification) => !notification.seen).length
    console.log('[context.notifications] Total unread count:', totalUnreadCount)

    setUnreadNotificationsCount(totalUnreadCount)
    setNotificationEntities(
      notifications.reduce((acc, notification) => {
        acc[notification.id] = notification
        return acc
      }, {})
    )

    return notifications
  }

  const sortedNotifications = createMemo(() => {
    return Object.values(notificationEntities).sort((a, b) => b.timestamp - a.timestamp)
  })

  const storeNotification = async (notification: SSEMessage) => {
    console.log('[context.notifications] Storing notification:', notification)

    const storage = await db()
    const tx = storage.transaction('notifications', 'readwrite')
    const store = tx.objectStore('notifications')

    await store.put(notification, 'id')
    await tx.done
    loadNotifications()
  }

  const [messageHandler, setMessageHandler] = createSignal<MessageHandler>(console.warn)

  createEffect(async () => {
    if (isAuthenticated()) {
      loadNotifications()

      await fetchEventSource('https://connect.discours.io', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken()
        },
        onmessage(event) {
          const m: SSEMessage = JSON.parse(event.data)
          if (m.entity === 'chat') {
            console.log('[context.notifications] Received message:', m)
            messageHandler()(m)
          } else {
            console.log('[context.notifications] Received notification:', m)
            storeNotification({
              ...m,
              id: event.id,
              timestamp: Date.now(),
              seen: false
            })
          }
        },
        onclose() {
          console.log('[context.notifications] sse connection closed by server')
        },
        onerror(err) {
          console.error('[context.notifications] sse connection closed by error', err)
          throw new Error(err) // NOTE: simple hack to close the connection
        }
      })
    }
  })

  const markNotificationAsRead = async (notification: SSEMessage) => {
    console.log('[context.notifications] Marking notification as read:', notification)

    const storage = await db()
    await storage.put('notifications', { ...notification, seen: true })
    loadNotifications()
  }

  const showNotificationsPanel = () => {
    setIsNotificationsPanelOpen(true)
  }

  const hideNotificationsPanel = () => {
    setIsNotificationsPanelOpen(false)
  }

  const actions = {
    setMessageHandler,
    showNotificationsPanel,
    hideNotificationsPanel,
    markNotificationAsRead
  }

  const value: NotificationsContextType = {
    notificationEntities,
    sortedNotifications,
    unreadNotificationsCount,
    actions
  }

  const handleNotificationPanelClose = () => {
    setIsNotificationsPanelOpen(false)
  }

  return (
    <NotificationsContext.Provider value={value}>
      {props.children}
      <ShowIfAuthenticated>
        <Portal>
          <NotificationsPanel isOpen={isNotificationsPanelOpen()} onClose={handleNotificationPanelClose} />
        </Portal>
      </ShowIfAuthenticated>
    </NotificationsContext.Provider>
  )
}
