import type { Accessor, JSX } from 'solid-js'

import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Portal } from 'solid-js/web'

import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { Notification } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { apiBaseUrl } from '../utils/config'
import SSEService, { EventData } from '../utils/sseService'

import { useSession } from './session'
import { Portal } from 'solid-js/web'
import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { IDBPDatabase, openDB } from 'idb'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from '../graphql/privateGraphQLClient'
import { Author, Message, Reaction, Shout } from '../graphql/types.gen'

export const PAGE_SIZE = 20
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
  sortedNotifications: Accessor<Notification[]>
  loadedNotificationsCount: Accessor<number>
  totalNotificationsCount: Accessor<number>
  actions: {
    showNotificationsPanel: () => void
    hideNotificationsPanel: () => void
    markNotificationAsRead: (notification: Notification) => Promise<void>
    markAllNotificationsAsRead: () => Promise<void>
    loadNotifications: (options: { limit: number; offset: number }) => Promise<Notification[]>
    setMessageHandler: (h: MessageHandler) => void
  }
}

export const PAGE_SIZE = 20
const NotificationsContext = createContext<NotificationsContextType>()

export function useNotifications() {
  return useContext(NotificationsContext)
}

const sseService = new SSEService()

export const NotificationsProvider = (props: { children: JSX.Element }) => {
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = createSignal(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = createSignal(0)
  const [totalNotificationsCount, setTotalNotificationsCount] = createSignal(0)
  const { isAuthenticated, user } = useSession()
  const [notificationEntities, setNotificationEntities] = createStore<Record<number, SSEMessage>>({})
  const [db, setDb] = createSignal<Promise<IDBPDatabase<unknown>>>()

  onMount(() => {
    const dbx = openDB('notifications-db', 1, {
      upgrade(indexedDb) {
        indexedDb.createObjectStore('notifications')
      },
    })
    setDb(dbx)
  })

  const loadNotifications = async (options: { limit: number; offset?: number }) => {
    const { notifications, totalUnreadCount, totalCount } = await apiClient.getNotifications(options)
    const newNotificationEntities = notifications.reduce((acc, notification) => {
      acc[notification.id] = notification
      return acc
    }, {})

    setTotalNotificationsCount(totalCount)
    setUnreadNotificationsCount(totalUnreadCount)
    setNotificationEntities(
      notifications.reduce((acc, notification) => {
        acc[notification.id] = notification
        return acc
      }, {}),
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

  const loadedNotificationsCount = createMemo(() => Object.keys(notificationEntities).length)

  createEffect(() => {
    if (isAuthenticated()) {
      sseService.connect(`${apiBaseUrl}/subscribe/${user().id}`)
      sseService.subscribeToEvent('message', (data: EventData) => {
        if (data.type === 'newNotifications') {
          loadNotifications({ limit: Math.max(PAGE_SIZE, loadedNotificationsCount()) })
        } else {
          console.error(`[NotificationsProvider] unknown message type: ${JSON.stringify(data)}`)
        }
      })
    } else {
      sseService.disconnect()
    }
  })
  const [messageHandler, setMessageHandler] = createSignal<MessageHandler>(console.warn)

  createEffect(async () => {
    if (isAuthenticated()) {
      loadNotifications()

      await fetchEventSource('https://chat.discours.io/connect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
        onmessage(event) {
          const m: SSEMessage = JSON.parse(event.data)
          console.log('[context.notifications] Received message:', m)
          if (m.entity === 'chat' || m.entity == 'message') {
            messageHandler()(m)
          } else {
            storeNotification({
              ...m,
              id: event.id,
              timestamp: Date.now(),
              seen: false,
            })
          }
        },
        onclose() {
          console.log('[context.notifications] sse connection closed by server')
        },
        onerror(err) {
          console.error('[context.notifications] sse connection closed by error', err)
          throw new Error(err) // NOTE: simple hack to close the connection
        },
      })
    }
  })

  const markNotificationAsRead = async (notification: Notification) => {
    await apiClient.markNotificationAsRead(notification.id)
    setNotificationEntities(notification.id, 'seen', true)
    setUnreadNotificationsCount((oldCount) => oldCount - 1)
  }
  const markAllNotificationsAsRead = async () => {
    await apiClient.markAllNotificationsAsRead()
    loadNotifications({ limit: loadedNotificationsCount() })
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
    markNotificationAsRead,
    markAllNotificationsAsRead,
    loadNotifications,
  }

  const value: NotificationsContextType = {
    notificationEntities,
    sortedNotifications,
    unreadNotificationsCount,
    loadedNotificationsCount,
    totalNotificationsCount,
    actions,
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
