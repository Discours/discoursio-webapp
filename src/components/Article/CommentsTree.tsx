import { createEffect, createMemo, createSignal, For, onMount, Show, Suspense } from 'solid-js'
import { useSession } from '../../context/session'
import Comment from './Comment'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import styles from '../../styles/Article.module.scss'
import { createReaction, useReactionsStore } from '../../stores/zine/reactions'
import type { Reaction } from '../../graphql/types.gen'
import { clsx } from 'clsx'
import { byCreated, byStat } from '../../utils/sortby'
import { Loading } from '../Loading'
import GrowingTextarea from '../_shared/GrowingTextarea'
import { ReactionKind } from '../../graphql/types.gen'

type NestedReaction = {
  children: Reaction[] | []
} & Reaction

const ARTICLE_COMMENTS_PAGE_SIZE = 50

export const CommentsTree = (props: { shoutSlug: string; shoutId: number }) => {
  const [getCommentsPage, setCommentsPage] = createSignal(0)
  const [commentsOrder, setCommentsOrder] = createSignal<'rating' | 'createdAt'>('createdAt')
  const [isCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const { session } = useSession()
  const { sortedReactions, loadReactionsBy } = useReactionsStore()
  const reactions = createMemo<Reaction[]>(() =>
    sortedReactions().sort(commentsOrder() === 'rating' ? byStat('rating') : byCreated)
  )

  const loadMore = async () => {
    try {
      const page = getCommentsPage()
      setIsCommentsLoading(true)
      const { hasMore } = await loadReactionsBy({
        by: { shout: props.shoutSlug, comment: true },
        limit: ARTICLE_COMMENTS_PAGE_SIZE,
        offset: page * ARTICLE_COMMENTS_PAGE_SIZE
      })
      setIsLoadMoreButtonVisible(hasMore)
    } finally {
      setIsCommentsLoading(false)
    }
  }

  onMount(async () => await loadMore())

  const nestComments = (commentList) => {
    const commentMap = {}
    commentList.forEach((comment) => {
      commentMap[comment.id] = comment
      if (comment.replyTo !== null) {
        const parent = commentMap[comment.replyTo] ?? []
        ;(parent.children = parent.children || []).push(comment)
      }
    })
    return commentList.filter((comment) => {
      return !comment.replyTo
    })
  }
  const [reactionTree, setReactionTree] = createSignal([])

  createEffect(() => {
    setReactionTree(nestComments(reactions().reverse()))
  })

  const [loading, setLoading] = createSignal<boolean>(false)
  const [error, setError] = createSignal<string | null>(null)
  const handleSubmitComment = async (value) => {
    console.log('!!! test:', value)
    try {
      setLoading(true)
      await createReaction({
        kind: ReactionKind.Comment,
        body: value,
        shout: props.shoutId
      })
      setLoading(false)
    } catch (error) {
      setError(t('Something went wrong, please try again'))
      console.error('[handleCreate reaction]:', error)
    }
  }

  return (
    <>
      <Show when={!isCommentsLoading()} fallback={<Loading />}>
        <div class={styles.commentsHeaderWrapper}>
          <h2 id="comments" class={styles.commentsHeader}>
            {t('Comments')} {reactions().length.toString() || ''}
          </h2>

          <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
            <li classList={{ selected: commentsOrder() === 'createdAt' || !commentsOrder() }}>
              <a
                href="#"
                onClick={(ev) => {
                  ev.preventDefault()
                  setCommentsOrder('createdAt')
                }}
              >
                {t('By time')}
              </a>
            </li>
            <li classList={{ selected: commentsOrder() === 'rating' }}>
              <a
                href="#"
                onClick={(ev) => {
                  ev.preventDefault()
                  setCommentsOrder('rating')
                }}
              >
                {t('By rating')}
              </a>
            </li>
          </ul>
        </div>

        <ul class={styles.comments}>
          <Suspense>
            <For each={reactionTree()}>
              {(reaction: NestedReaction) => (
                <Comment
                  comment={reaction}
                  canEdit={reaction?.createdBy?.slug === session()?.user?.slug}
                  children={reaction?.children}
                />
              )}
            </For>
          </Suspense>
        </ul>

        <Show when={isLoadMoreButtonVisible()}>
          <button onClick={loadMore}>{t('Load more')}</button>
        </Show>
      </Show>

      <GrowingTextarea
        placeholder={t('Write comment')}
        submitButtonText={t('Send')}
        cancelButtonText={t('cancel')}
        submit={(value) => handleSubmitComment(value)}
        loading={loading()}
        errorMessage={error()}
      />
    </>
  )
}
