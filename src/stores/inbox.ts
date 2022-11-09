import { atom } from 'nanostores'
import type { Chat } from '../graphql/types.gen'

export const chats = atom<Chat[]>([])
