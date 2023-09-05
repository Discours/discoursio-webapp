import type { Accessor, JSX } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'

type NotificationsContextType = {
  actions: {}
}

const NotificationsContext = createContext<NotificationsContextType>()

export function useNotifications() {
  return useContext(NotificationsContext)
}

export const NotificationsProvider = (props: { children: JSX.Element }) => {
  const actions = {}

  const value: NotificationsContextType = { actions }

  return <NotificationsContext.Provider value={value}>{props.children}</NotificationsContext.Provider>
}
