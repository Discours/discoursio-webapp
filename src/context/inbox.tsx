import type { Accessor, JSX } from 'solid-js'
import type { Chat, Message, MessagesBy, MutationCreate_MessageArgs } from '../graphql/schema/chat.gen'

import { createContext, createSignal, useContext } from 'solid-js'

import { inboxClient } from '../graphql/client/chat'
import { Author } from '../graphql/schema/core.gen'
import { useAuthorsStore } from '../stores/zine/authors'

import { SSEMessage, useConnect } from './connect'

type InboxContextType = {
  chats: Accessor<Chat[]>
  messages?: Accessor<Message[]>
  createChat: (members: number[], title: string) => Promise<{ chat: Chat }>
  loadChats: () => Promise<Chat[]>
  loadRecipients: () => Author[]
  loadMessages: (by: MessagesBy, limit: number, offset: number) => Promise<Message[]>
  getMessages?: (chatId: string) => Promise<Message[]>
  sendMessage?: (args: MutationCreate_MessageArgs) => void
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chats, setChats] = createSignal<Chat[]>([])
  const [messages, setMessages] = createSignal<Message[]>([])
  const { sortedAuthors } = useAuthorsStore()

  const handleMessage = (sseMessage: SSEMessage) => {
    // handling all action types: create update delete join left seen
    if (sseMessage.entity === 'message') {
      console.debug('[context.inbox]:', sseMessage.payload)
      const relivedMessage: Message = sseMessage.payload as Message
      setMessages((prev) => [...prev, relivedMessage])
    } else if (sseMessage.entity === 'chat') {
      console.debug('[context.inbox]:', sseMessage.payload)
      const relivedChat: Chat = sseMessage.payload as Chat
      setChats((prev) => [...prev, relivedChat])
    }
  }

  const { addHandler } = useConnect()
  addHandler(handleMessage)

  const loadMessages = async (by: MessagesBy, limit = 50, offset = 0): Promise<Message[]> => {
    if (inboxClient.private) {
      const msgs = await inboxClient.loadChatMessages({ by, limit, offset })
      setMessages((mmm) => [...new Set([...mmm, ...msgs])])
      return msgs || []
    }
    return []
  }
  const loadChats = async () => {
    try {
      if (inboxClient.private) {
        const newChats = await inboxClient.loadChats({ limit: 50, offset: 0 })
        setChats(newChats)
        return newChats
      }
    } catch (error) {
      console.log('[loadChats] error:', error)
    }
    return []
  }

  const getMessages = async (chatId: string) => {
    if (!chatId) return []
    try {
      const msgs: Message[] = await loadMessages({ chat: chatId })
      setMessages(msgs)
      return msgs || []
    } catch (error) {
      console.error('Error loading messages:', error)
    }
    return []
  }

  const sendMessage = async (args: MutationCreate_MessageArgs) => {
    try {
      if (inboxClient.private) {
        const message = await inboxClient.createMessage(args)
        setMessages((prev) => [...prev, message])
        const currentChat = chats().find((chat) => chat.id === args.chat_id)
        setChats((prev) => [
          ...prev.filter((c) => c.id !== currentChat.id),
          { ...currentChat, updated_at: message.created_at },
        ])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const createChat = async (members: number[], title: string) => {
    try {
      if (inboxClient.private) {
        const chat = await inboxClient.createChat({ members, title })
        setChats((prevChats) => [chat, ...prevChats])
        return chat
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const actions = {
    createChat,
    loadChats,
    loadMessages,
    loadRecipients: sortedAuthors,
    getMessages,
    sendMessage,
  }

  const value: InboxContextType = { chats, messages, ...actions }

  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
