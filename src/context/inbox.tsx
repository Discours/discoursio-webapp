import { Accessor, createMemo, JSX, onMount } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'
import { createChatClient } from '../graphql/privateGraphQLClient'
import type { Chat } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import newMessages from '../graphql/subs/new-messages'

type InboxContextType = {
  chats: Accessor<Chat[]>
  actions: {
    createChat: (members: number[], title: string) => Promise<void>
    loadChats: () => Promise<void>
    setListener: (listener: (ev) => void) => void
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chats, setChats] = createSignal<Chat[]>([])
  const [listener, setListener] = createSignal(console.debug)
  const subclient = createMemo(() => createChatClient(listener()))
  const loadChats = async () => {
    try {
      const newChats = await apiClient.getChats({ limit: 50, offset: 0 })
      setChats(
        newChats.sort((x, y) => {
          return x.updatedAt < y.updatedAt ? 1 : -1
        })
      )
    } catch (error) {
      console.log(error)
    }
  }

  const createChat = async (members: number[], title: string) => {
    const chat = await apiClient.createChat({ members, title })
    setChats((prevChats) => {
      return [chat, ...prevChats]
    })
    return chat
  }

  const actions = {
    createChat,
    loadChats,
    setListener // setting listening handler
  }
  onMount(() => {
    const resp = subclient().subscription(newMessages, {})
    console.debug(resp)
  })
  const value: InboxContextType = { chats, actions }
  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
