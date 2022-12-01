import type { JSX } from 'solid-js'
import { createContext, useContext } from 'solid-js'
import type { Message } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { createStore } from 'solid-js/store'

type InboxContextType = {
  chatEntities: { [chatId: string]: Message[] }
  actions: {
    createChat: (members: number[], title: string) => Promise<void>
  }
}

const InboxContext = createContext<InboxContextType>()

export function useInbox() {
  return useContext(InboxContext)
}

export const InboxProvider = (props: { children: JSX.Element }) => {
  const [chatEntities, setChatEntities] = createStore({})

  const createChat = async (members: number[], title: string) => {
    const chat = await apiClient.createChat({ members, title })
    setChatEntities((s) => {
      s[chat.id] = chat
    })
    return chat
  }

  const actions = {
    createChat
  }

  const value: InboxContextType = { chatEntities, actions }
  return <InboxContext.Provider value={value}>{props.children}</InboxContext.Provider>
}
