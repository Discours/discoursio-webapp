import type { JSX } from 'solid-js'

import { createContext, onCleanup, useContext } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { Reaction, ReactionBy, ReactionInput, ReactionKind } from '../graphql/schema/core.gen'

type ReactionsContextType = {
  reactionEntities: Record<number, Reaction>
  actions: {
    loadReactionsBy: ({ by, limit }: { by: ReactionBy; limit?: number }) => Promise<Reaction[]>
    createReaction: (reaction: ReactionInput) => Promise<void>
    updateReaction: (id: number, reaction: ReactionInput) => Promise<void>
    deleteReaction: (id: number) => Promise<void>
  }
}

const ReactionsContext = createContext<ReactionsContextType>()

export function useReactions() {
  return useContext(ReactionsContext)
}

export const ReactionsProvider = (props: { children: JSX.Element }) => {
  const [reactionEntities, setReactionEntities] = createStore<Record<number, Reaction>>({})

  const loadReactionsBy = async ({
    by,
    limit,
  }: {
    by: ReactionBy
    limit?: number
  }): Promise<Reaction[]> => {
    const reactions = await apiClient.getReactionsBy({ by, limit })
    const newReactionEntities = reactions.reduce((acc, reaction) => {
      acc[reaction.id] = reaction
      return acc
    }, {})
    setReactionEntities(newReactionEntities)
    return reactions
  }

  const createReaction = async (input: ReactionInput): Promise<void> => {
    const reaction = await apiClient.createReaction(input)

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

  const deleteReaction = async (id: number): Promise<void> => {
    const reaction = await apiClient.destroyReaction(id)
    setReactionEntities({
      [reaction.id]: undefined,
    })
  }

  const updateReaction = async (id: number, input: ReactionInput): Promise<void> => {
    const reaction = await apiClient.updateReaction(id, input)
    setReactionEntities(reaction.id, reaction)
  }

  onCleanup(() => setReactionEntities(reconcile({})))

  const actions = {
    loadReactionsBy,
    createReaction,
    updateReaction,
    deleteReaction,
  }

  const value: ReactionsContextType = { reactionEntities, actions }

  return <ReactionsContext.Provider value={value}>{props.children}</ReactionsContext.Provider>
}
