import type { Accessor, JSX } from 'solid-js'

import { createContext, createEffect, createMemo, createSignal, onMount, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Portal } from 'solid-js/web'

import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { notifierClient } from '../graphql/client/notifier'
import { Notification } from '../graphql/schema/notifier.gen'

import { SSEMessage, useConnect } from './connect'
import { useSession } from './session'

type NotificationsContextType = {
  notificationEntities: Record<number, Notification>
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
  }
}

export const PAGE_SIZE = 20
const NotificationsContext = createContext<NotificationsContextType>()

export function useNotifications() {
  return useContext(NotificationsContext)
}

export const NotificationsProvider = (props: { children: JSX.Element }) => {
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = createSignal(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = createSignal(0)
  const [totalNotificationsCount, setTotalNotificationsCount] = createSignal(0)
  const [notificationEntities, setNotificationEntities] = createStore<Record<number, Notification>>({})
  const {
    isAuthenticated,
    actions: { getToken },
  } = useSession()

  const apiClient = createMemo(() => {
    const token = getToken()
    if (!notifierClient.private) {
      notifierClient.connect(token)
      return notifierClient
    }
  })

  const { addHandler } = useConnect()

  const loadNotifications = async (options: { limit?: number; offset?: number }) => {
    const client = apiClient()
    if (isAuthenticated() && client) {
      console.debug(client)
      const { notifications, unread, total } = await client.getNotifications(options)
      const newNotificationEntities = notifications.reduce((acc, notification) => {
        acc[notification.id] = notification
        return acc
      }, {})

      setTotalNotificationsCount(total)
      setUnreadNotificationsCount(unread)
      setNotificationEntities(newNotificationEntities)
      console.debug(`[context.notifications] updated`)
      return notifications
    } else {
      return []
    }
  }

  const sortedNotifications = createMemo(() => {
    return Object.values(notificationEntities).sort((a, b) => b.created_at - a.created_at)
  })

  const loadedNotificationsCount = createMemo(() => Object.keys(notificationEntities).length)

  onMount(() => {
    addHandler((data: SSEMessage) => {
      if (data.entity === 'reaction' && isAuthenticated()) {
        loadNotifications({ limit: Math.max(PAGE_SIZE, loadedNotificationsCount()) })
      } else {
        console.error(`[NotificationsProvider] unhandled message type: ${JSON.stringify(data)}`)
      }
    })
  })

  const markNotificationAsRead = async (notification: Notification) => {
    const client = apiClient()
    if (client) {
      await client.markNotificationAsRead(notification.id)
    }
    const nnn = new Set([...notification.seen, notification.id])
    setNotificationEntities(notification.id, 'seen', [...nnn])
    setUnreadNotificationsCount((oldCount) => oldCount - 1)
  }
  const markAllNotificationsAsRead = async () => {
    const client = apiClient()
    if (isAuthenticated() && client) {
      await client.markAllNotificationsAsRead()
      await loadNotifications({ limit: loadedNotificationsCount() })
    }
  }

  const showNotificationsPanel = () => {
    setIsNotificationsPanelOpen(true)
  }

  const hideNotificationsPanel = () => {
    setIsNotificationsPanelOpen(false)
  }

  const actions = {
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
