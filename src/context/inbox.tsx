import type { Chat, Message, MessagesBy, MutationCreate_MessageArgs } from '../graphql/schema/chat.gen'
import type { Accessor, JSX } from 'solid-js'

import { createContext, createEffect, createSignal, useContext } from 'solid-js'

import { inboxClient } from '../graphql/client/chat'
import { Author } from '../graphql/schema/core.gen'
import { useAuthorsStore } from '../stores/zine/authors'

import { SSEMessage, useConnect } from './connect'
import { useSession } from './session'

type InboxContextType = {
  chats: Accessor<Chat[]>
  messages?: Accessor<Message[]>
  actions: {
    createChat: (members: number[], title: string) => Promise<{ chat: Chat }>
    loadChats: () => Promise<Array<Chat>>
    loadRecipients: () => Array<Author>
    loadMessages: (by: MessagesBy, limit: number, offset: number) => Promise<Array<Message>>
    getMessages?: (chatId: string) => Promise<Array<Message>>
    sendMessage?: (args: MutationCreate_MessageArgs) => void
  }
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
    console.log('[context.inbox]:', sseMessage)

    // handling all action types: create update delete join left seen
    if (sseMessage.entity === 'message') {
      const relivedMessage = sseMessage.payload
      setMessages((prev) => [...prev, relivedMessage])
    } else if (sseMessage.entity === 'chat') {
      const relivedChat = sseMessage.payload
      setChats((prev) => [...prev, relivedChat])
    }
  }

  const { addHandler } = useConnect()
  addHandler(handleMessage)

  const loadMessages = async (
    by: MessagesBy,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Array<Message>> => {
    if (inboxClient.private) {
      const msgs = await inboxClient.loadChatMessages({ by, limit, offset })
      setMessages((mmm) => [...mmm, ...msgs]) // TODO: check unique
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

  const value: InboxContextType = { chats, messages, actions }

  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
