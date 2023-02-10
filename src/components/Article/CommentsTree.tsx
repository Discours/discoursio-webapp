import { Show, createMemo, createSignal, onMount, For } from 'solid-js'
import { Comment } from './Comment'
import { t } from '../../utils/intl'
import styles from '../../styles/Article.module.scss'
import { createReaction, useReactionsStore } from '../../stores/zine/reactions'
import type { Reaction } from '../../graphql/types.gen'
import { clsx } from 'clsx'
import { byCreated, byStat } from '../../utils/sortby'
import { Loading } from '../Loading'
import { Author, ReactionKind } from '../../graphql/types.gen'
import { useSession } from '../../context/session'
import CommentEditor from '../_shared/CommentEditor'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import Button from '../_shared/Button'

const ARTICLE_COMMENTS_PAGE_SIZE = 50

type Props = {
  commentAuthors: Author[]
  shoutSlug: string
  shoutId: number
}

export const CommentsTree = (props: Props) => {
  const [getCommentsPage, setCommentsPage] = createSignal(0)
  const [commentsOrder, setCommentsOrder] = createSignal<'rating' | 'createdAt'>('createdAt')
  const [isCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const { sortedReactions, loadReactionsBy } = useReactionsStore()

  const reactions = createMemo<Reaction[]>(() =>
    sortedReactions().sort(commentsOrder() === 'rating' ? byStat('rating') : byCreated)
  )

  const { session } = useSession()
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

  const [submitted, setSubmitted] = createSignal<boolean>(false)
  const handleSubmitComment = async (value) => {
    try {
      await createReaction(
        {
          kind: ReactionKind.Comment,
          body: value,
          shout: props.shoutId
        },
        {
          name: session().user.name,
          userpic: session().user.userpic,
          slug: session().user.slug
        }
      )
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
            {t('Comments')} {reactions().length.toString() || ''}
          </h2>

          <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
            <li classList={{ selected: commentsOrder() === 'createdAt' || !commentsOrder() }}>
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
          <For
            each={reactions()
              .reverse()
              .filter((r) => !r.replyTo)}
          >
            {(reaction) => (
              <Comment
                isArticleAuthor={Boolean(props.commentAuthors.some((a) => a.slug === session()?.user.slug))}
                reactions={reactions()}
                comment={reaction}
              />
            )}
          </For>
        </ul>
        <Show when={isLoadMoreButtonVisible()}>
          <button onClick={loadMore}>{t('Load more')}</button>
        </Show>
        <ShowOnlyOnClient>
          <CommentEditor
            placeholder={t('Write a comment...')}
            clear={submitted()}
            onSubmit={(value) => handleSubmitComment(value)}
          />
        </ShowOnlyOnClient>
      </Show>
    </div>
  )
}
