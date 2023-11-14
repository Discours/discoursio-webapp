import type { Accessor, JSX } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'
// import { createSubClient } from '../graphql/privateGraphQLClient'
import type { Chat, Message, MutationCreateMessageArgs } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
// import type { Client } from '@urql/core'
import { loadMessages } from '../stores/inbox'

type InboxContextType = {
  chats: Accessor<Chat[]>
  messages?: Accessor<Message[]>
  actions: {
    createChat: (members: number[], title: string) => Promise<{ chat: Chat }>
    loadChats: () => Promise<void>
    getMessages?: (chatId: string) => Promise<void>
    sendMessage?: (args: MutationCreateMessageArgs) => void
    // unsubscribe: () => void
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chats, setChats] = createSignal<Chat[]>([])
  const [messages, setMessages] = createSignal<Message[]>([])
  // const subclient = createMemo<Client>(() => createSubClient())
  const loadChats = async () => {
    try {
      const newChats = await apiClient.getChats({ limit: 50, offset: 0 })
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
      console.error('[loadMessages]', error)
    }
  }

  const sendMessage = async (args) => {
    try {
      const message = await apiClient.createMessage(args)
      setMessages((prev) => [...prev, message])
      const currentChat = chats().find((chat) => chat.id === args.chat)
      setChats((prev) => [
        ...prev.filter((c) => c.id !== currentChat.id),
        { ...currentChat, updatedAt: message.createdAt },
      ])
    } catch (error) {
      console.error('[post message error]:', error)
    }
  }

  const createChat = async (members: number[], title: string) => {
    const chat = await apiClient.createChat({ members, title })
    setChats((prevChats) => {
      return [chat, ...prevChats]
    })
    return chat
  }

  // pipe(
  //   subclient().subscription(newMessage, {}),
  //   subscribe((result) => {
  //     console.info('[subscription]')
  //     console.debug(result)
  //     // TODO: handle data result
  //   })
  // )

  const actions = {
    createChat,
    loadChats,
    getMessages,
    sendMessage,
    // unsubscribe // TODO: call unsubscribe some time!
  }

  const value: InboxContextType = { chats, messages, actions }
  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
