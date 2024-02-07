import type { Accessor, JSX } from 'solid-js'

import { createStorageSignal } from '@solid-primitives/storage'
import { createContext, createMemo, createSignal, onMount, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Portal } from 'solid-js/web'

import { NotificationsPanel } from '../components/NotificationsPanel'
import { ShowIfAuthenticated } from '../components/_shared/ShowIfAuthenticated'
import { notifierClient } from '../graphql/client/notifier'
import { NotificationGroup, QueryLoad_NotificationsArgs } from '../graphql/schema/notifier.gen'

import { SSEMessage, useConnect } from './connect'
import { useSession } from './session'

type NotificationsContextType = {
  notificationEntities: Record<string, NotificationGroup>
  unreadNotificationsCount: Accessor<number>
  after: Accessor<number>
  sortedNotifications: Accessor<NotificationGroup[]>
  loadedNotificationsCount: Accessor<number>
  totalNotificationsCount: Accessor<number>
  showNotificationsPanel: () => void
  hideNotificationsPanel: () => void
  markSeen: (notification_id: number) => Promise<void>
  markSeenThread: (threadId: string) => Promise<void>
  markSeenAll: () => Promise<void>
  loadNotificationsGrouped: (options: QueryLoad_NotificationsArgs) => Promise<NotificationGroup[]>
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
  const [notificationEntities, setNotificationEntities] = createStore<Record<string, NotificationGroup>>({})
  const { isAuthenticated } = useSession()
  const { addHandler } = useConnect()

  const loadNotificationsGrouped = async (options: { after: number; limit?: number; offset?: number }) => {
    if (isAuthenticated() && notifierClient?.private) {
      const notificationsResult = await notifierClient.getNotifications(options)
      const groups = notificationsResult?.notifications || []
      const total = notificationsResult?.total || 0
      const unread = notificationsResult?.unread || 0

      const newGroupsEntries = groups.reduce((acc, group: NotificationGroup) => {
        acc[group.id] = group
        return acc
      }, {})

      setTotalNotificationsCount(total)
      setUnreadNotificationsCount(unread)
      setNotificationEntities(newGroupsEntries)
      console.debug('[context.notifications] groups updated', groups)
      return groups
    }
    return []
  }

  const sortedNotifications = createMemo(() => {
    return Object.values(notificationEntities).sort((a, b) => b.updated_at - a.updated_at)
  })

  const now = Math.floor(Date.now() / 1000)
  const loadedNotificationsCount = createMemo(() => Object.keys(notificationEntities).length)
  const [after, setAfter] = createStorageSignal('notifier_timestamp', now)

  onMount(() => {
    addHandler((data: SSEMessage) => {
      if (data.entity === 'reaction' && isAuthenticated()) {
        console.info('[context.notifications] event', data)
        loadNotificationsGrouped({ after: after(), limit: Math.max(PAGE_SIZE, loadedNotificationsCount()) })
      }
    })
    setAfter(now)
  })

  const markSeenThread = async (threadId: string) => {
    if (notifierClient.private) await notifierClient.markSeenThread(threadId)
    const thread = notificationEntities[threadId]
    thread.seen = true
    setNotificationEntities((nnn) => ({ ...nnn, [threadId]: thread }))
    setUnreadNotificationsCount((oldCount) => oldCount - 1)
  }

  const markSeenAll = async () => {
    if (isAuthenticated() && notifierClient.private) {
      await notifierClient.markSeenAfter({ after: after() })
      await loadNotificationsGrouped({ after: after(), limit: loadedNotificationsCount() })
    }
  }

  const markSeen = async (notification_id: number) => {
    if (isAuthenticated() && notifierClient.private) {
      await notifierClient.markSeen(notification_id)
      await loadNotificationsGrouped({ after: after(), limit: loadedNotificationsCount() })
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
    markSeenThread,
    markSeenAll,
    markSeen,
    loadNotificationsGrouped
  }

  const value: NotificationsContextType = {
    after,
    notificationEntities,
    sortedNotifications,
    unreadNotificationsCount,
    loadedNotificationsCount,
    totalNotificationsCount,
    ...actions
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
