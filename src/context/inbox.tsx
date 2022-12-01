import type { Accessor, JSX } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'
import type { Chat } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { createStore } from 'solid-js/store'

type InboxContextType = {
  chats: Accessor<Chat[]>
  actions: {
    createChat: (members: string[], title: string) => Promise<void>
    loadChats: () => Promise<void>
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chats, setChats] = createSignal<Chat[]>([])
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

  const createChat = async (members: string[], title: string) => {
    const chat = await apiClient.createChat({ members, title })
    setChats((prevChats) => {
      return [chat, ...prevChats]
    })
    return chat
  }

  const actions = {
    createChat,
    loadChats
  }

  const value: InboxContextType = { chats, actions }
  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
