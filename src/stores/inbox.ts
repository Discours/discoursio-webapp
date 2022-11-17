import { createSignal } from 'solid-js'
import type { Chat } from '../graphql/types.gen'

export const [chats, setChats] = createSignal<Chat[]>([])
