import type { Accessor, JSX } from 'solid-js'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { createContext, useContext, createSignal, createEffect } from 'solid-js'

import { useAuthorizer } from './authorizer'
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
  const {
    isAuthenticated,
    actions: { getToken },
  } = useSession()

  const addHandler = (handler: MessageHandler) => {
    setHandlers((hhh) => [...hhh, handler])
  }
  const [retried, setRetried] = createSignal<number>(0)
  const listen = () => {
    const token = getToken()
    console.log(`[context.connect] token: ${token}`)
    if (token && !connected() && retried() < 4) {
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
          setConnected(false)
        },
        onerror(err) {
          console.error('[context.connect] sse connection error', err)
          setRetried((r) => r + 1)
          setConnected(false)
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
