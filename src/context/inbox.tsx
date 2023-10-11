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

  fetchEventSource('https://connect.discours.io', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getToken()
    },
    body: JSON.stringify({
      foo: 'bar'
    }),
    onmessage(event) {
      const message = JSON.parse(event.data)

      // TODO: Do something with the message

      console.log(message)
    },
    onclose() {
      // if no error thrown - it will reconnect
      console.log('sse connection closed by server')
    },
    onerror(err) {
      console.warn(err)
      console.error('sse connection closed by error')
      throw new Error() // hack to close the connection
    }
  })

  // TODO: maybe sometimes need to call /disconnect

  const loadChats = async () => {
    try {
      const newChats = await inboxClient.getChats({ limit: 50, offset: 0 })
      setChats(newChats)
    } catch (error) {
      console.log(error)
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
      const message = await inboxClient.createMessage(args)
      setMessages((prev) => [...prev, message])
      const currentChat = chats().find((chat) => chat.id === args.chat)
      setChats((prev) => [
        ...prev.filter((c) => c.id !== currentChat.id),
        { ...currentChat, updatedAt: message.createdAt }
      ])
    } catch (error) {
      console.error('[post message error]:', error)
    }
  }

  const createChat = async (members: number[], title: string) => {
    const chat = await inboxClient.createChat({ members, title })
    setChats((prevChats) => {
      return [chat, ...prevChats]
    })
    return chat
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
