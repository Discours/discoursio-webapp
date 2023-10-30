import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { useSession } from './session'
import SSEService, { EventData } from '../utils/sseService'
import { apiBaseUrl } from '../utils/config'
import { Portal } from 'solid-js/web'
import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { apiClient } from '../utils/apiClient'
import { createStore } from 'solid-js/store'
import { Notification } from '../graphql/types.gen'

type NotificationsContextType = {
  notificationEntities: Record<number, Notification>
  unreadNotificationsCount: Accessor<number>
  sortedNotifications: Accessor<Notification[]>
  actions: {
    showNotificationsPanel: () => void
    hideNotificationsPanel: () => void
    markNotificationAsRead: (notification: Notification) => Promise<void>
    markAllNotificationsAsRead: () => Promise<void>
    loadNotifications: (options: { limit: number; offset: number }) => Promise<Notification[]>
  }
}

const NotificationsContext = createContext<NotificationsContextType>()

export function useNotifications() {
  return useContext(NotificationsContext)
}

const sseService = new SSEService()

export const NotificationsProvider = (props: { children: JSX.Element }) => {
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = createSignal(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = createSignal(0)
  const { isAuthenticated, user } = useSession()
  const [notificationEntities, setNotificationEntities] = createStore<Record<number, Notification>>({})

  const loadNotifications = async (options: { limit: number; offset?: number }) => {
    const { notifications, totalUnreadCount } = await apiClient.getNotifications(options)
    const newNotificationEntities = notifications.reduce((acc, notification) => {
      acc[notification.id] = notification
      return acc
    }, {})

    setUnreadNotificationsCount(totalUnreadCount)
    setNotificationEntities(newNotificationEntities)
    return notifications
  }

  const sortedNotifications = createMemo(() => {
    return Object.values(notificationEntities).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  createEffect(() => {
    if (isAuthenticated()) {
      loadNotifications({ limit: 2 })

      sseService.connect(`${apiBaseUrl}/subscribe/${user().id}`)
      sseService.subscribeToEvent('message', (data: EventData) => {
        if (data.type === 'newNotifications') {
          loadNotifications({ limit: 2 })
        } else {
          console.error(`[NotificationsProvider] unknown message type: ${JSON.stringify(data)}`)
        }
      })
    } else {
      sseService.disconnect()
    }
  })

  const markNotificationAsRead = async (notification: Notification) => {
    await apiClient.markNotificationAsRead(notification.id)
    // loadNotifications({ limit: 3 })
  }
  const markAllNotificationsAsRead = async () => {
    await apiClient.markAllNotificationsAsRead()
    setNotificationEntities({})
    // loadNotifications({ limit: 3 })
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
    loadNotifications
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
