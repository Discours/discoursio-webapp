import type { JSX } from 'solid-js'
import { createContext, useContext } from 'solid-js'
import type { Message, Chat } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { createStore } from 'solid-js/store'

type InboxContextType = {
  chatEntities: { [chatId: string]: Message[] }
  actions: {
    createChat: (memberSlugs: string[], title?: string) => Promise<void>
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chatEntities, setChatEntities] = createStore({})

  const createChat = async (memberSlugs: string[], title?: string) => {
    // @ts-ignore FIXME: вывести типы
    const chat = await apiClient.createChat({ string, title })

    // @ts-ignore FIXME: вывести типы
    setChatEntities(chat.id, chat)
  }

  const actions = {
    createChat
  }
  const value: InboxContextType = { chatEntities, actions }
  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
