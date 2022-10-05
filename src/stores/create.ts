import { persistentAtom } from '@nanostores/persistent'
import { Reaction, ReactionKind } from '../graphql/types.gen'
import { atom, computed } from 'nanostores'
import { reactions } from './zine/reactions'

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

const drafts = persistentAtom<Draft[]>('drafts', [], {
  encode: JSON.stringify,
  decode: JSON.parse
}) // save drafts on device

const collabs = atom<Collab[]>([]) // save collabs in backend or in p2p network

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
export { drafts, collabs /* approvals, proposals */ }
