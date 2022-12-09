import { Accessor, createMemo, JSX, onMount } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'
import { createChatClient } from '../graphql/privateGraphQLClient'
import type { Chat } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import newMessage from '../graphql/subs/new-message'
import type { Client } from '@urql/core'
import { pipe, subscribe } from 'wonka'

type InboxContextType = {
  chats: Accessor<Chat[]>
  actions: {
    createChat: (members: number[], title: string) => Promise<{ chat: Chat }>
    loadChats: () => Promise<void>
    unsubscribe: () => void
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chats, setChats] = createSignal<Chat[]>([])
  const subclient = createMemo<Client>(() => createChatClient())
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

  const { unsubscribe } = pipe(
    subclient().subscription(newMessage, {}),
    subscribe((result) => {
      console.debug('[subscription] ' + result)
      // TODO: handle data result
    })
  )
  const actions = {
    createChat,
    loadChats,
    unsubscribe // TODO: call unsubscribe some time!
  }

  const value: InboxContextType = { chats, actions }
  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
