import type { Accessor, JSX } from 'solid-js'

import { createContext, createSignal, onCleanup, useContext } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { Reaction, ReactionBy, ReactionInput, ReactionKind } from '../graphql/schema/core.gen'
import { useSession } from './session'

type ReactionsContextType = {
  reactionEntities: Accessor<Record<number, Reaction>>
  loadReactionsBy: ({
    by,
    limit,
    offset,
  }: {
    by: ReactionBy
    limit?: number
    offset?: number
  }) => Promise<Reaction[]>
  createReaction: (reaction: ReactionInput) => Promise<void>
  updateReaction: (reaction: ReactionInput) => Promise<Reaction>
  deleteReaction: (id: number) => Promise<void>
}

const ReactionsContext = createContext<ReactionsContextType>()

export function useReactions() {
  return useContext(ReactionsContext)
}

export const ReactionsProvider = (props: { children: JSX.Element }) => {
  const [reactionEntities, setReactionEntities] = createSignal<Record<number, Reaction> | undefined>()
  const { author } = useSession()

  const loadReactionsBy = async ({
    by,
    limit,
    offset,
  }: {
    by: ReactionBy
    limit?: number
    offset?: number
  }): Promise<Reaction[]> => {
    const reactions = await apiClient.getReactionsBy({ by, limit, offset })
    const newReactionEntities = reactions.reduce(
      (acc: { [reaction_id: number]: Reaction }, reaction: Reaction) => {
        acc[reaction.id] = reaction
        return acc
      },
      {},
    )
    setReactionEntities(newReactionEntities)
    return reactions
  }

  const createReaction = async (input: ReactionInput): Promise<void> => {
    const fakeId = Date.now() + Math.floor(Math.random() * 1000)
    setReactionEntities((rrr: Record<number, Reaction>) => ({
      ...rrr,
      [fakeId]: {
        ...input,
        id: fakeId,
        created_by: author(),
        created_at: Math.floor(Date.now() / 1000),
      } as unknown as Reaction,
    }))
    const reaction = await apiClient.createReaction(input)
    setReactionEntities({ [fakeId]: undefined })
    if (!reaction) return
    const changes = {
      [reaction.id]: reaction,
    }

    if ([ReactionKind.Like, ReactionKind.Dislike].includes(reaction.kind)) {
      const oppositeReactionKind =
        reaction.kind === ReactionKind.Like ? ReactionKind.Dislike : ReactionKind.Like

      const oppositeReaction = Object.values(reactionEntities).find(
        (r) =>
          r.kind === oppositeReactionKind &&
          r.created_by.slug === reaction.created_by.slug &&
          r.shout.id === reaction.shout.id &&
          r.reply_to === reaction.reply_to,
      )

      if (oppositeReaction) {
        changes[oppositeReaction.id] = undefined
      }
    }

    setReactionEntities(changes)
  }

  const deleteReaction = async (reaction: number): Promise<void> => {
    setReactionEntities({ [reaction]: undefined })
    await apiClient.destroyReaction(reaction)
  }

  const updateReaction = async (input: ReactionInput): Promise<Reaction> => {
    const reaction = await apiClient.updateReaction(input)
    if (reaction) {
      setReactionEntities((rrr) => {
        rrr[reaction.id] = reaction
        return rrr
      })
    }
    return reaction
  }

  onCleanup(() => setReactionEntities(reconcile({})))

  const actions = {
    loadReactionsBy,
    createReaction,
    updateReaction,
    deleteReaction,
  }

  const value: ReactionsContextType = { reactionEntities, ...actions }

  return <ReactionsContext.Provider value={value}>{props.children}</ReactionsContext.Provider>
}
