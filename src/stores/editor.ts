import { createStorageSignal } from '@solid-primitives/storage'
import type { Reaction } from '../graphql/types.gen'
import { createSignal } from 'solid-js'

// TODO: store drafts
// import type { Draft } from '../components/EditorExample/store/context'

interface Collab {
  authors: string[] // slugs
  invites?: string[]
  createdAt: Date
  body?: string
  title?: string
}

export const drafts = createStorageSignal<{ [key: string]: string }>('drafts', {}) // save drafts on device
export const [collabs, setCollabs] = createSignal<Collab[]>([]) // save collabs in backend or in p2p network
export const [editorReactions, setReactions] = createSignal<Reaction[]>([])
/*

TODO: approvals and proposals derived stores

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
