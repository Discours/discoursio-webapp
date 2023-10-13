import type { Accessor, JSX } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { Chat, Message, MutationCreateMessageArgs } from '../graphql/types.gen'
import { inboxClient } from '../utils/apiClient'
import { getToken } from '../graphql/privateGraphQLClient'
import { loadMessages } from '../stores/inbox'

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

  fetchEventSource('https://chat.discours.io/connect', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    onmessage(event) {
      const message = JSON.parse(event.data)
      console.log('Received message:', message)
      // TODO: Add the message to the appropriate chat
    },
    onclose() {
      console.log('sse connection closed by server')
    },
    onerror(err) {
      console.error('sse connection closed by error', err)
    }
  })

  const loadChats = async () => {
    try {
      const newChats = await inboxClient.loadChats({ limit: 50, offset: 0 })
      setChats(newChats)
    } catch (error) {
      console.error('Error loading chats:', error)
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
      const currentChat = chats().find((chat) => chat.id === args.chat)
      setChats((prev) => [
        ...prev.filter((c) => c.id !== currentChat.id),
        { ...currentChat, updatedAt: message.createdAt }
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
    sendMessage
  }

  const value: InboxContextType = { chats, messages, actions }

  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
