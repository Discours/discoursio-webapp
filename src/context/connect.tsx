import type { Accessor, JSX } from 'solid-js'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { createContext, useContext, createSignal, createEffect } from 'solid-js'

import { useSession } from './session'
import { useAuthorizer } from './authorizer'

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
    if (isAuthenticated() && !connected() && retried() < 4) {
      try {
        fetchEventSource('https://connect.discours.io', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getToken(),
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
            setConnected(false)
            throw new Error(err) // NOTE: simple hack to close the connection
          },
        })
      } catch (err) {
        if (retried() < 4) {
          setRetried((r) => r + 1)
        } else {
          console.warn('Not trying to reconnect anymore; listen() should be called again.')
        }
      }
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
