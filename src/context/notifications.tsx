import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createSignal, useContext } from 'solid-js'
import { useSession } from './session'
import SSEService, { EventData } from '../utils/sseService'
import { apiBaseUrl } from '../utils/config'
import { Portal } from 'solid-js/web'
import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { NotificationsPanel } from '../components/NotificationsPanel'

type Notification = {
  id: number
}

type NotificationsContextType = {
  notificationEntities: Record<number, Notification>
  unreadNotificationsCount: Accessor<number>
  actions: {
    showNotificationsPanel: () => void
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

  const loadNotifications = () => {}

  createEffect(() => {
    if (isAuthenticated()) {
      loadNotifications()

      sseService.connect(`${apiBaseUrl}/subscribe/${user().id}`)
      sseService.subscribeToEvent('message', (data: EventData) => {
        if (data.type === 'newNotifications') {
          loadNotifications()
        } else {
          console.error(`[NotificationsProvider] unknown message type: ${JSON.stringify(data)}`)
        }
      })
    } else {
      sseService.disconnect()
    }
  })

  const notificationEntities = {}

  const showNotificationsPanel = () => {
    setIsNotificationsPanelOpen(true)
  }

  const actions = { showNotificationsPanel }

  const value: NotificationsContextType = { notificationEntities, unreadNotificationsCount, actions }

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
