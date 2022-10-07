import { persistentAtom } from '@nanostores/persistent'
import type { Reaction } from '../graphql/types.gen'
import { atom } from 'nanostores'
import { createSignal } from 'solid-js'

interface Draft {
  createdAt: Date
  body?: string
  title?: string
}

interface Collab {
  authors: string[] // slugs
  invites?: string[]
  createdAt: Date
  body?: string
  title?: string
}

export const drafts = persistentAtom<Draft[]>('drafts', [], {
  encode: JSON.stringify,
  decode: JSON.parse
}) // save drafts on device

export const collabs = atom<Collab[]>([]) // save collabs in backend or in p2p network
export const [editorReactions, setReactions] = createSignal<Reaction[]>([])
/*
const approvals = computed(
  reactions,
  (rdict) => Object.values(rdict)
    .filter((r: Reaction) => r.kind === ReactionKind.Accept)
)
const proposals = computed<Reaction[], typeof reactions>(
  reactions,
  (rdict) => Object.values(rdict)
    .filter((r: Reaction) => r.kind === ReactionKind.Propose)
)
*/
