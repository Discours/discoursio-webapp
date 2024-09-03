import type { Accessor, JSX } from 'solid-js'

import { createContext, createMemo, createSignal, onCleanup, useContext } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { coreApiUrl } from '~/config'
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
import { graphqlClientCreate } from '../graphql/client'
import { useLocalize } from './localize'
import { useSession } from './session'
import { useSnackbar } from './ui'

type ReactionsContextType = {
  reactionEntities: Record<number, Reaction>
  reactionsByShout: Record<number, Reaction[]>
  commentsByAuthor: Accessor<Record<number, Reaction[]>>
  loadReactionsBy: (args: QueryLoad_Reactions_ByArgs) => Promise<Reaction[]>
  createReaction: (reaction: MutationCreate_ReactionArgs) => Promise<void>
  updateReaction: (reaction: MutationUpdate_ReactionArgs) => Promise<Reaction>
  deleteReaction: (id: number) => Promise<{ error: string } | null>
  addReactions: (rrr: Reaction[]) => void
}

const ReactionsContext = createContext<ReactionsContextType>({} as ReactionsContextType)

export function useReactions() {
  return useContext(ReactionsContext)
}

export const ReactionsProvider = (props: { children: JSX.Element }) => {
  const [reactionEntities, setReactionEntities] = createStore<Record<number, Reaction>>({})
  const [reactionsByShout, setReactionsByShout] = createStore<Record<number, Reaction[]>>({})
  const [reactionsByAuthor, setReactionsByAuthor] = createStore<Record<number, Reaction[]>>({})
  const [commentsByAuthor, setCommentsByAuthor] = createSignal<Record<number, Reaction[]>>({})
  const { t } = useLocalize()
  const { showSnackbar } = useSnackbar()
  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  const addReactions = (rrr: Reaction[]) => {
    const newReactionsByShout: Record<number, Reaction[]> = { ...reactionsByShout }
    const newReactionsByAuthor: Record<number, Reaction[]> = { ...reactionsByAuthor }
    const newReactionEntities = rrr.reduce(
      (acc: { [reaction_id: number]: Reaction }, reaction: Reaction) => {
        acc[reaction.id] = reaction
        if (!newReactionsByShout[reaction.shout.id]) newReactionsByShout[reaction.shout.id] = []
        newReactionsByShout[reaction.shout.id].push(reaction)
        if (!newReactionsByAuthor[reaction.created_by.id]) newReactionsByAuthor[reaction.created_by.id] = []
        newReactionsByAuthor[reaction.created_by.id].push(reaction)
        return acc
      },
      { ...reactionEntities }
    )

    setReactionEntities(newReactionEntities)
    setReactionsByShout(newReactionsByShout)
    setReactionsByAuthor(newReactionsByAuthor)

    const newCommentsByAuthor = Object.fromEntries(
      Object.entries(newReactionsByAuthor).map(([authorId, reactions]) => [
        authorId,
        reactions.filter((x: Reaction) => x.kind === ReactionKind.Comment)
      ])
    )

    setCommentsByAuthor(newCommentsByAuthor)
  }

  const loadReactionsBy = async (opts: QueryLoad_Reactions_ByArgs): Promise<Reaction[]> => {
    !opts.by && console.warn('reactions provider got wrong opts')
    const fetcher = await loadReactions(opts)
    const result = (await fetcher()) || []
    console.debug('[context.reactions] loaded', result)
    result && addReactions(result)
    return result
  }

  const createReaction = async (input: MutationCreate_ReactionArgs): Promise<void> => {
    const resp = await client()?.mutation(createReactionMutation, input).toPromise()
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
      const resp = await client()?.mutation(destroyReactionMutation, { reaction_id }).toPromise()
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
    const resp = await client()?.mutation(updateReactionMutation, input).toPromise()
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
    deleteReaction,
    addReactions
  }

  const value: ReactionsContextType = { reactionEntities, reactionsByShout, commentsByAuthor, ...actions }

  return <ReactionsContext.Provider value={value}>{props.children}</ReactionsContext.Provider>
}
