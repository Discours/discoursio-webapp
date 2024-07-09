import type { JSX } from 'solid-js'

import { createContext, onCleanup, useContext } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { loadReactions } from '~/graphql/api/public'
import createReactionMutation from '~/graphql/mutation/core/reaction-create'
import destroyReactionMutation from '~/graphql/mutation/core/reaction-destroy'
import updateReactionMutation from '~/graphql/mutation/core/reaction-update'
import {
  MutationCreate_ReactionArgs,
  MutationUpdate_ReactionArgs,
  QueryLoad_Reactions_ByArgs,
  Reaction,
  ReactionKind
} from '~/graphql/schema/core.gen'
import { useGraphQL } from './graphql'
import { useLocalize } from './localize'
import { useSnackbar } from './ui'

type ReactionsContextType = {
  reactionEntities: Record<number, Reaction>
  reactionsByShout: Record<string, Reaction[]>
  loadReactionsBy: (args: QueryLoad_Reactions_ByArgs) => Promise<Reaction[]>
  createReaction: (reaction: MutationCreate_ReactionArgs) => Promise<void>
  updateReaction: (reaction: MutationUpdate_ReactionArgs) => Promise<Reaction>
  deleteReaction: (id: number) => Promise<{ error: string } | null>
}

const ReactionsContext = createContext<ReactionsContextType>({} as ReactionsContextType)

export function useReactions() {
  return useContext(ReactionsContext)
}

export const ReactionsProvider = (props: { children: JSX.Element }) => {
  const [reactionEntities, setReactionEntities] = createStore<Record<number, Reaction>>({})
  const [reactionsByShout, setReactionsByShout] = createStore<Record<number, Reaction[]>>({})
  const { t } = useLocalize()
  const { showSnackbar } = useSnackbar()
  const { mutation } = useGraphQL()

  const loadReactionsBy = async (opts: QueryLoad_Reactions_ByArgs): Promise<Reaction[]> => {
    const fetcher = await loadReactions(opts)
    const result = (await fetcher()) || []
    console.debug('[context.reactions] loaded', result)
    const newReactionsByShout: Record<string, Reaction[]> = {}
    const newReactionEntities = result.reduce(
      (acc: { [reaction_id: number]: Reaction }, reaction: Reaction) => {
        acc[reaction.id] = reaction
        if (!newReactionsByShout[reaction.shout.slug]) newReactionsByShout[reaction.shout.slug] = []
        newReactionsByShout[reaction.shout.slug].push(reaction)
        return acc
      },
      {}
    )
    setReactionsByShout(newReactionsByShout)
    setReactionEntities(newReactionEntities)
    return result
  }

  const createReaction = async (input: MutationCreate_ReactionArgs): Promise<void> => {
    const resp = await mutation(createReactionMutation, input).toPromise()
    const { error, reaction } = resp?.data?.create_reaction || {}
    if (error) await showSnackbar({ type: 'error', body: t(error) })
    if (!reaction) return
    const changes = {
      [reaction.id]: reaction
    }

    if ([ReactionKind.Like, ReactionKind.Dislike].includes(reaction.kind)) {
      const oppositeReactionKind =
        reaction.kind === ReactionKind.Like ? ReactionKind.Dislike : ReactionKind.Like

      const oppositeReaction = Object.values(reactionEntities).find(
        (r) =>
          r.kind === oppositeReactionKind &&
          r.created_by.slug === reaction.created_by.slug &&
          r.shout.id === reaction.shout.id &&
          r.reply_to === reaction.reply_to
      )

      if (oppositeReaction) {
        changes[oppositeReaction.id] = undefined
      }
    }

    setReactionEntities(changes)
  }

  const deleteReaction = async (
    reaction_id: number
  ): Promise<{ error: string; reaction?: string } | null> => {
    if (reaction_id) {
      const resp = await mutation(destroyReactionMutation, { reaction_id }).toPromise()
      const result = resp?.data?.destroy_reaction
      if (!result.error) {
        setReactionEntities({
          [reaction_id]: undefined
        })
      }
      return result
    }
    return null
  }

  const updateReaction = async (input: MutationUpdate_ReactionArgs): Promise<Reaction> => {
    const resp = await mutation(updateReactionMutation, input).toPromise()
    const result = resp?.data?.update_reaction
    if (!result) throw new Error('cannot update reaction')
    const { error, reaction } = result
    if (error) await showSnackbar({ type: 'error', body: t(error) })
    if (reaction) setReactionEntities(reaction.id, reaction)
    return reaction
  }

  onCleanup(() => setReactionEntities(reconcile({})))

  const actions = {
    loadReactionsBy,
    createReaction,
    updateReaction,
    deleteReaction
  }

  const value: ReactionsContextType = { reactionEntities, reactionsByShout, ...actions }

  return <ReactionsContext.Provider value={value}>{props.children}</ReactionsContext.Provider>
}
