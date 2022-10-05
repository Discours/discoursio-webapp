import { atom } from 'nanostores'
import type { ChatResult } from '../graphql/types.gen'

export const chats = atom<ChatResult[]>([])
