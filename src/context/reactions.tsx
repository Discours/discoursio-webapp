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
  const [reactionEntities, setReactionEntities] = createStore<Record<number, Reaction>>({})
  const [reactionsByShout, setReactionsByShout] = createStore<Record<number, Reaction[]>>({})
  const [reactionsByAuthor, setReactionsByAuthor] = createStore<Record<number, Reaction[]>>({})
  const [commentsByAuthor, setCommentsByAuthor] = createSignal<Record<number, Reaction[]>>({})
  const { t } = useLocalize()
  const { showSnackbar } = useSnackbar()
  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  const addShoutReactions = (rrr: Reaction[]) => {
    const newReactionEntities = rrr.reduce(
      (acc: Record<number, Reaction>, reaction: Reaction) => {
        acc[reaction.id] = reaction
        return acc
      },
      { ...reactionEntities }
    )

    const newReactionsByShout = { ...reactionsByShout }
    const newReactionsByAuthor = { ...reactionsByAuthor }

    rrr.forEach((reaction) => {
      if (!newReactionsByShout[reaction.shout.id]) newReactionsByShout[reaction.shout.id] = []
      newReactionsByShout[reaction.shout.id].push(reaction)

      if (!newReactionsByAuthor[reaction.created_by.id]) newReactionsByAuthor[reaction.created_by.id] = []
      newReactionsByAuthor[reaction.created_by.id].push(reaction)
    })

    setReactionEntities(reconcile(newReactionEntities))
    setReactionsByShout(reconcile(newReactionsByShout))
    setReactionsByAuthor(reconcile(newReactionsByAuthor))

    const newCommentsByAuthor = Object.fromEntries(
      Object.entries(newReactionsByAuthor).map(([authorId, reactions]) => [
        authorId,
        reactions.filter((x: Reaction) => x.kind === ReactionKind.Comment)
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
        // Находим реакцию, которую нужно удалить
        const reactionToDelete = reactionEntities[reaction_id]

        if (reactionToDelete) {
          // Удаляем из reactionEntities
          const newReactionEntities = { ...reactionEntities }
          delete newReactionEntities[reaction_id]

          // Удаляем из reactionsByShout
          const newReactionsByShout = { ...reactionsByShout }
          const shoutReactions = newReactionsByShout[reactionToDelete.shout.id]
          if (shoutReactions) {
            newReactionsByShout[reactionToDelete.shout.id] = shoutReactions.filter(
              (r) => r.id !== reaction_id
            )
          }

          // Удаляем из reactionsByAuthor
          const newReactionsByAuthor = { ...reactionsByAuthor }
          const authorReactions = newReactionsByAuthor[reactionToDelete.created_by.id]
          if (authorReactions) {
            newReactionsByAuthor[reactionToDelete.created_by.id] = authorReactions.filter(
              (r) => r.id !== reaction_id
            )
          }

          // Обновляем стои с использованием reconcile
          setReactionEntities(reconcile(newReactionEntities))
          setReactionsByShout(reconcile(newReactionsByShout))
          setReactionsByAuthor(reconcile(newReactionsByAuthor))
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
    if (reaction) setReactionEntities(reaction.id, reaction) // use setter to update store
    return reaction
  }

  onCleanup(() => setReactionEntities(reconcile({})))

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
