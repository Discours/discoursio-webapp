import type { Accessor, JSX } from 'solid-js'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { createContext, useContext, createSignal, createEffect } from 'solid-js'
import { getToken } from '../graphql/privateGraphQLClient'
import { useSession } from './session'

export interface SSEMessage {
  id: string
  entity: string
  action: string
  payload: any // Author | Shout | Reaction | Message
  created_at?: number // unixtime x1000
  seen?: boolean
}

type MessageHandler = (m: SSEMessage) => void

export interface ConnectContextType {
  addHandler: (handler: MessageHandler) => void
  connected: Accessor<boolean>
}

const ConnectContext = createContext<ConnectContextType>()

export const ConnectProvider = (props: { children: JSX.Element }) => {
  const [messageHandlers, setHandlers] = createSignal<Array<MessageHandler>>([])
  // const [messages, setMessages] = createSignal<Array<SSEMessage>>([]);

  const [connected, setConnected] = createSignal(false)
  const { isAuthenticated, author } = useSession()

  const addHandler = (handler: MessageHandler) => {
    setHandlers((hhh) => [...hhh, handler])
  }

  const listen = () => {
    const token = getToken()
    if (token) {
      fetchEventSource('https://connect.discours.io', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        onmessage(event) {
          const m: SSEMessage = JSON.parse(event.data)
          console.log('[context.connect] Received message:', m)

          // Iterate over all registered handlers and call them
          messageHandlers().forEach((handler) => handler(m))
        },
        onclose() {
          console.log('[context.connect] sse connection closed by server')
        },
        onerror(err) {
          console.error('[context.connect] sse connection closed by error', err)
          throw new Error(err) // NOTE: simple hack to close the connection
        },
      })
    }
  }

  createEffect(() => {
    if (isAuthenticated() && !connected()) {
      listen()
      setConnected(true)
    }
  })

  const value: ConnectContextType = { addHandler, connected }

  return <ConnectContext.Provider value={value}>{props.children}</ConnectContext.Provider>
}

export const useConnect = () => useContext(ConnectContext)
