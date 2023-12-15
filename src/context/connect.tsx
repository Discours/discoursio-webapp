import type { Accessor, JSX } from 'solid-js'

import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { createContext, useContext, createSignal, createEffect } from 'solid-js'

import { useSession } from './session'

const RECONNECT_TIMES = 2

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
  createEffect(async () => {
    if (isAuthenticated() && !connected()) {
      const token = getToken()
      if (token) {
        await fetchEventSource('https://connect.discours.io', {
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
          async onopen(response) {
            console.log('[context.connect] SSE connection opened', response)
            if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
              setConnected(true)
              return
            } else if (response.status === 401) {
              throw new Error('unauthorized')
            } else {
              setRetried((r) => r + 1)
              throw new Error()
            }
          },
          onclose() {
            console.log('[context.connect] SSE connection closed by server')
            setConnected(false)
          },
          onerror(err) {
            if (err.message == 'unauthorized' || retried() > RECONNECT_TIMES) {
              throw err // rethrow to stop the operation
            } else {
              // do nothing to automatically retry. You can also
              // return a specific retry interval here.
            }
          },
        })

        return
      }
    }
  })

  const value: ConnectContextType = { addHandler, connected }

  return <ConnectContext.Provider value={value}>{props.children}</ConnectContext.Provider>
}

export const useConnect = () => useContext(ConnectContext)
