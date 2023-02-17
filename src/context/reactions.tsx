import type { JSX } from 'solid-js'
import { createContext, onCleanup, useContext } from 'solid-js'
import type { Reaction, ReactionBy, ReactionInput } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { createStore } from 'solid-js/store'

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
    limit
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
    setReactionEntities(reaction.id, reaction)
  }

  const deleteReaction = async (id: number): Promise<void> => {
    const reaction = await apiClient.destroyReaction(id)
    console.debug('[deleteReaction]:', reaction.id)
    setReactionEntities(({ [reaction.id]: _deletedReaction, ...rest }) => rest)
  }

  const updateReaction = async (id: number, input: ReactionInput): Promise<void> => {
    const reaction = await apiClient.updateReaction(id, input)
    setReactionEntities(reaction.id, reaction)
  }

  onCleanup(() => setReactionEntities({}))

  const actions = {
    loadReactionsBy,
    createReaction,
    updateReaction,
    deleteReaction
  }

  const value: ReactionsContextType = { reactionEntities, actions }

  return <ReactionsContext.Provider value={value}>{props.children}</ReactionsContext.Provider>
}
