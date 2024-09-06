import type { Accessor, JSX } from 'solid-js'
import { createContext, createMemo, createSignal, onCleanup, useContext } from 'solid-js'
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
  reactionEntities: Accessor<Record<number, Reaction>>
  reactionsByShout: Accessor<Record<number, Reaction[]>>
  commentsByAuthor: Accessor<Record<number, Reaction[]>>
  loadReactionsBy: (args: QueryLoad_Reactions_ByArgs) => Promise<Reaction[]>
  createShoutReaction: (reaction: MutationCreate_ReactionArgs) => Promise<void>
  updateShoutReaction: (reaction: MutationUpdate_ReactionArgs) => Promise<Reaction>
  deleteShoutReaction: (id: number) => Promise<{ error: string } | null>
  addShoutReactions: (rrr: Reaction[]) => void
}

const ReactionsContext = createContext<ReactionsContextType>({} as ReactionsContextType)

export function useReactions() {
  return useContext(ReactionsContext)
}

export const ReactionsProvider = (props: { children: JSX.Element }) => {
  const [reactionEntities, setReactionEntities] = createSignal<Record<number, Reaction>>({})
  const [reactionsByShout, setReactionsByShout] = createSignal<Record<number, Reaction[]>>({})
  const [reactionsByAuthor, setReactionsByAuthor] = createSignal<Record<number, Reaction[]>>({})
  const [commentsByAuthor, setCommentsByAuthor] = createSignal<Record<number, Reaction[]>>({})
  const { t } = useLocalize()
  const { showSnackbar } = useSnackbar()
  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  const addShoutReactions = (rrr: Reaction[]) => {
    const newReactionEntities = { ...reactionEntities() }
    const newReactionsByShout = { ...reactionsByShout() }
    const newReactionsByAuthor = { ...reactionsByAuthor() }

    rrr.forEach((reaction) => {
      newReactionEntities[reaction.id] = reaction

      if (!newReactionsByShout[reaction.shout.id]) newReactionsByShout[reaction.shout.id] = []
      newReactionsByShout[reaction.shout.id].push(reaction)

      if (!newReactionsByAuthor[reaction.created_by.id]) newReactionsByAuthor[reaction.created_by.id] = []
      newReactionsByAuthor[reaction.created_by.id].push(reaction)
    })

    setReactionEntities(newReactionEntities)
    setReactionsByShout(newReactionsByShout)
    setReactionsByAuthor(newReactionsByAuthor)

    const newCommentsByAuthor = Object.fromEntries(
      Object.entries(newReactionsByAuthor).map(([authorId, reactions]) => [
        authorId,
        reactions.filter((x) => x.kind === ReactionKind.Comment)
      ])
    )

    setCommentsByAuthor(newCommentsByAuthor)
  }

  const loadReactionsBy = async (opts: QueryLoad_Reactions_ByArgs): Promise<Reaction[]> => {
    if (!opts.by) console.warn('reactions provider got wrong opts')
    const fetcher = await loadReactions(opts)
    const result = (await fetcher()) || []
    console.debug('[context.reactions] loaded', result)
    if (result) addShoutReactions(result)
    return result
  }

  const createShoutReaction = async (input: MutationCreate_ReactionArgs): Promise<void> => {
    const resp = await client()?.mutation(createReactionMutation, input).toPromise()
    const { error, reaction } = resp?.data?.create_reaction || {}
    if (error) await showSnackbar({ type: 'error', body: t(error) })
    if (!reaction) return
    addShoutReactions([reaction])
  }

  const deleteShoutReaction = async (
    reaction_id: number
  ): Promise<{ error: string; reaction?: string } | null> => {
    if (reaction_id) {
      const resp = await client()?.mutation(destroyReactionMutation, { reaction_id }).toPromise()
      const result = resp?.data?.destroy_reaction

      if (!result.error) {
        const reactionToDelete = reactionEntities()[reaction_id]

        if (reactionToDelete) {
          const newReactionEntities = { ...reactionEntities() }
          delete newReactionEntities[reaction_id]

          const newReactionsByShout = { ...reactionsByShout() }
          const shoutReactions = newReactionsByShout[reactionToDelete.shout.id]
          if (shoutReactions) {
            newReactionsByShout[reactionToDelete.shout.id] = shoutReactions.filter(
              (r) => r.id !== reaction_id
            )
          }

          const newReactionsByAuthor = { ...reactionsByAuthor() }
          const authorReactions = newReactionsByAuthor[reactionToDelete.created_by.id]
          if (authorReactions) {
            newReactionsByAuthor[reactionToDelete.created_by.id] = authorReactions.filter(
              (r) => r.id !== reaction_id
            )
          }

          setReactionEntities(newReactionEntities)
          setReactionsByShout(newReactionsByShout)
          setReactionsByAuthor(newReactionsByAuthor)
        }
      }

      return result
    }
    return null
  }

  const updateShoutReaction = async (input: MutationUpdate_ReactionArgs): Promise<Reaction> => {
    const resp = await client()?.mutation(updateReactionMutation, input).toPromise()
    const result = resp?.data?.update_reaction
    if (!result) throw new Error('cannot update reaction')
    const { error, reaction } = result
    if (error) await showSnackbar({ type: 'error', body: t(error) })
    if (reaction) {
      const newReactionEntities = { ...reactionEntities() }
      newReactionEntities[reaction.id] = reaction
      setReactionEntities(newReactionEntities)
    }
    return reaction
  }

  onCleanup(() => setReactionEntities({}))

  const actions = {
    loadReactionsBy,
    createShoutReaction,
    updateShoutReaction,
    deleteShoutReaction,
    addShoutReactions
  }

  const value: ReactionsContextType = {
    reactionEntities,
    reactionsByShout,
    commentsByAuthor,
    ...actions
  }

  return <ReactionsContext.Provider value={value}>{props.children}</ReactionsContext.Provider>
}
