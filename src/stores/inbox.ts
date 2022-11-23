import { createSignal } from 'solid-js'
import type { Chat } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'

export const [chats, setChats] = createSignal<Chat[]>([])

export const loadAuthorsBy = async (by?: any): Promise<void> => {
  return await apiClient.getAuthorsBy({ by })
}

export const loadChats = async (): Promise<void> => {
  return await apiClient.getChats({ limit: 0, offset: 50 })
}
