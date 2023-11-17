import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createSignal, onMount, useContext } from 'solid-js'
import type { Chat, Message, MutationCreateMessageArgs } from '../graphql/types.gen'
import { inboxClient } from '../utils/apiClient'
import { loadMessages } from '../stores/inbox'
import { getToken } from '../graphql/privateGraphQLClient'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export interface SSEMessage {
  id: string
  entity: string
  action: string
  payload: any // Author | Shout | Reaction | Message
  timestamp?: number
  seen?: boolean
}

type InboxContextType = {
  chats: Accessor<Chat[]>
  messages?: Accessor<Message[]>
  actions: {
    createChat: (members: number[], title: string) => Promise<{ chat: Chat }>
    loadChats: () => Promise<void>
    getMessages?: (chatId: string) => Promise<void>
    sendMessage?: (args: MutationCreateMessageArgs) => void
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chats, setChats] = createSignal<Chat[]>([])
  const [messages, setMessages] = createSignal<Message[]>([])

  const handleMessage = (sseMessage) => {
    console.log('[context.inbox]:', sseMessage)
    // TODO: handle all action types: create update delete join left
    if (sseMessage.entity == 'message') {
      const relivedMessage = sseMessage.payload
      setMessages((prev) => [...prev, relivedMessage])
    } else if (sseMessage.entity == 'chat') {
      const relivedChat = sseMessage.payload
      setChats((prev) => [...prev, relivedChat])
    }
  }

  createEffect(async () => {
    const token = getToken()
    if (token) {
      await fetchEventSource('https://chat.discours.io/connect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        onmessage(event) {
          const m: SSEMessage = JSON.parse(event.data)
          console.log('[context.inbox] Received message:', m)
          if (m.entity === 'chat' || m.entity == 'message') {
            handleMessage(m)
          } else {
            console.debug(m)
          }
        },
        onclose() {
          console.log('[context.inbox] sse connection closed by server')
        },
        onerror(err) {
          console.error('[context.inbox] sse connection closed by error', err)
          throw new Error(err) // NOTE: simple hack to close the connection
        },
      })
    }
  })

  const loadChats = async () => {
    try {
      const newChats = await inboxClient.loadChats({ limit: 50, offset: 0 })
      setChats(newChats)
    } catch (error) {
      console.log('[loadChats]', error)
    }
  }

  const getMessages = async (chatId: string) => {
    if (!chatId) return
    try {
      const response = await loadMessages({ chat: chatId })
      setMessages(response as unknown as Message[])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (args: MutationCreateMessageArgs) => {
    try {
      const message = await inboxClient.createMessage(args)
      setMessages((prev) => [...prev, message])
      const currentChat = chats().find((chat) => chat.id === args.chat_id)
      setChats((prev) => [
        ...prev.filter((c) => c.id !== currentChat.id),
        { ...currentChat, updatedAt: message.createdAt },
      ])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const createChat = async (members: number[], title: string) => {
    try {
      const chat = await inboxClient.createChat({ members, title })
      setChats((prevChats) => [chat, ...prevChats])
      return chat
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const actions = {
    createChat,
    loadChats,
    getMessages,
    sendMessage,
  }

  const value: InboxContextType = { chats, messages, actions }

  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
