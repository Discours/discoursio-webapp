import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createSignal, useContext } from 'solid-js'
import { useSession } from './session'
import SSEService, { EventData } from '../utils/sseService'
import { apiBaseUrl } from '../utils/config'

type Notification = {
  id: number
}

type NotificationsContextType = {
  notificationEntities: Record<number, Notification>
}

const NotificationsContext = createContext<NotificationsContextType>()

export function useNotifications() {
  return useContext(NotificationsContext)
}

const sseService = new SSEService()

export const NotificationsProvider = (props: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useSession()

  createEffect(() => {
    if (isAuthenticated()) {
      console.log(user())
      sseService.connect(`${apiBaseUrl}/subscribe/${user().id}`)
      sseService.subscribeToEvent('message', (data: EventData) => {
        console.log(data)
      })
    } else {
      sseService.disconnect()
    }
  })

  const notificationEntities = {}

  const value: NotificationsContextType = { notificationEntities }

  return <NotificationsContext.Provider value={value}>{props.children}</NotificationsContext.Provider>
}
