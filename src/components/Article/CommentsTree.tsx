import { Show, createMemo, createSignal, onMount, For } from 'solid-js'
import { Comment } from './Comment'
import styles from '../../styles/Article.module.scss'
import { clsx } from 'clsx'
import { Loading } from '../_shared/Loading'
import { Author, ReactionKind } from '../../graphql/types.gen'
import { useSession } from '../../context/session'
import CommentEditor from '../_shared/CommentEditor'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { Button } from '../_shared/Button'
import { createStorage } from '@solid-primitives/storage'
import { useReactions } from '../../context/reactions'
import { byCreated } from '../../utils/sortby'
import { ShowIfAuthenticated } from '../_shared/ShowIfAuthenticated'
import { useLocalize } from '../../context/localize'

type CommentsOrder = 'createdAt' | 'rating'

type Props = {
  commentAuthors: Author[]
  shoutSlug: string
  shoutId: number
}

export const CommentsTree = (props: Props) => {
  const [isCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const [commentsOrder, setCommentsOrder] = createSignal<CommentsOrder>('createdAt')
  const {
    reactionEntities,
    actions: { loadReactionsBy, createReaction }
  } = useReactions()

  const { t } = useLocalize()

  // TODO: server side?
  const [store, setStore] = createStorage({ api: typeof localStorage === 'undefined' ? {} : localStorage })
  const [newReactionsCount, setNewReactionsCount] = createSignal<number>(0)

  const comments = createMemo(() =>
    Object.values(reactionEntities).filter((reaction) => reaction.kind === 'COMMENT')
  )

  const sortedComments = createMemo(() => {
    let newSortedComments = [...comments()]
    newSortedComments = newSortedComments.sort(byCreated)

    if (commentsOrder() === 'rating') {
      newSortedComments = newSortedComments.sort((a, b) => {
        if (a.replyTo && b.replyTo) {
          return 0
        }

        const x = (a?.stat && a.stat.rating) || 0
        const y = (b?.stat && b.stat.rating) || 0

        if (x > y) {
          return 1
        }
        if (x < y) {
          return -1
        }

        return 0
      })
    }

    newSortedComments.reverse()

    return newSortedComments
  })

  const updateNewReactionsCount = () => {
    const storeValue = Number(store[`${props.shoutSlug}`])
    const setVal = () => setStore(`${props.shoutSlug}`, `${comments().length}`)
    if (!store[`${props.shoutSlug}`]) {
      setVal()
    } else if (storeValue < comments().length) {
      setNewReactionsCount(comments().length - storeValue)
      setVal()
    }
  }

  const { session } = useSession()

  onMount(async () => {
    try {
      setIsCommentsLoading(true)
      await loadReactionsBy({
        by: { shout: props.shoutSlug }
      })
      updateNewReactionsCount()
    } finally {
      setIsCommentsLoading(false)
    }
  })

  const [submitted, setSubmitted] = createSignal<boolean>(false)
  const handleSubmitComment = async (value) => {
    try {
      await createReaction({
        kind: ReactionKind.Comment,
        body: value,
        shout: props.shoutId
      })
      setSubmitted(true)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
  }

  return (
    <div>
      <Show when={!isCommentsLoading()} fallback={<Loading />}>
        <div class={styles.commentsHeaderWrapper}>
          <h2 id="comments" class={styles.commentsHeader}>
            {t('Comments')} {comments().length.toString() || ''}
            <Show when={newReactionsCount() > 0}>
              <span class={styles.newReactions}>&nbsp;+{newReactionsCount()}</span>
            </Show>
          </h2>

          <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
            <li classList={{ selected: commentsOrder() === 'createdAt' }}>
              <Button
                variant="inline"
                value={t('By time')}
                onClick={() => {
                  setCommentsOrder('createdAt')
                }}
              />
            </li>
            <li classList={{ selected: commentsOrder() === 'rating' }}>
              <Button
                variant="inline"
                value={t('By rating')}
                onClick={() => {
                  setCommentsOrder('rating')
                }}
              />
            </li>
          </ul>
        </div>
        <ul class={styles.comments}>
          <For each={sortedComments().filter((r) => !r.replyTo)}>
            {(reaction) => (
              <Comment
                sortedComments={sortedComments()}
                isArticleAuthor={Boolean(props.commentAuthors.some((a) => a.slug === session()?.user.slug))}
                comment={reaction}
              />
            )}
          </For>
        </ul>
        <ShowIfAuthenticated
          fallback={
            <div class={styles.signInMessage} id="comments">
              {t('To write a comment, you must')}&nbsp;
              <a href="?modal=auth&mode=register" class={styles.link}>
                {t('sign up')}
              </a>
              &nbsp;{t('or')}&nbsp;
              <a href="?modal=auth&mode=login" class={styles.link}>
                {t('sign in')}
              </a>
            </div>
          }
        >
          <CommentEditor
            placeholder={t('Write a comment...')}
            clear={submitted()}
            onSubmit={(value) => handleSubmitComment(value)}
          />
        </ShowIfAuthenticated>
      </Show>
    </div>
  )
}
