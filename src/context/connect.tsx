import type { Accessor, JSX } from 'solid-js'

import type { Author, Reaction, Shout, Topic } from '../graphql/schema/core.gen'

import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { createContext, createEffect, createSignal, on, useContext } from 'solid-js'

import { Chat, Message } from '../graphql/schema/chat.gen'
import { sseUrl } from '../utils/config'
import { useSession } from './session'

const RECONNECT_TIMES = 2

export interface SSEMessage {
  id: string
  entity: string // follower | shout | reaction
  action: string // create | delete | update | join | follow | seen
  payload: Author | Shout | Topic | Reaction | Chat | Message
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
  const [messageHandlers, setHandlers] = createSignal<MessageHandler[]>([])
  const [connected, setConnected] = createSignal(false)
  const { session } = useSession()
  const [retried, setRetried] = createSignal<number>(0)

  const addHandler = (handler: MessageHandler) => {
    setHandlers((hhh) => [...hhh, handler])
  }

  createEffect(
    on(
      () => session()?.access_token,
      async (tkn) => {
        if (!sseUrl) return
        if (!tkn) return
        if (!connected() && retried() <= RECONNECT_TIMES) {
          console.info('[context.connect] got token, init SSE connection')
          try {
            await fetchEventSource(sseUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: tkn,
              },
              onmessage(event) {
                const m: SSEMessage = JSON.parse(event.data || '{}')
                console.log('[context.connect] Received message:', m)
                messageHandlers().forEach((handler) => handler(m))
              },
              onopen: (response) => {
                console.log('[context.connect] SSE connection opened', response)
                if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
                  setConnected(true)
                  setRetried(0)
                  return Promise.resolve()
                }
                return Promise.reject(`SSE: cannot connect to real-time updates: ${response.status}`)
              },
              onclose() {
                console.log('[context.connect] SSE connection closed by server')
                setConnected(false)
                if (retried() < RECONNECT_TIMES) {
                  setRetried((r) => r + 1)
                } else throw Error('closed by server')
              },
              onerror(err) {
                console.error('[context.connect] SSE connection error:', err)
                setConnected(false)
                if (retried() < RECONNECT_TIMES) {
                  setRetried((r) => r + 1)
                } else throw Error(err)
              },
            })
          } catch (error) {
            console.error('[context.connect] SSE connection failed:', error)
          }
        }
      },
    ),
  )

  const value: ConnectContextType = { addHandler, connected }

  return <ConnectContext.Provider value={value}>{props.children}</ConnectContext.Provider>
}

export const useConnect = () => useContext(ConnectContext)
