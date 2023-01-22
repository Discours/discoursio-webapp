import { For, Show, createMemo, createSignal, onMount } from 'solid-js'
import Comment from './Comment'
import { t } from '../../utils/intl'
import styles from '../../styles/Article.module.scss'
import { createReaction, useReactionsStore } from '../../stores/zine/reactions'
import type { Reaction } from '../../graphql/types.gen'
import { clsx } from 'clsx'
import { byCreated, byStat } from '../../utils/sortby'
import { Loading } from '../Loading'
import GrowingTextarea from '../_shared/GrowingTextarea'
import { ReactionKind } from '../../graphql/types.gen'
import { useSession } from '../../context/session'
import CommentEditor from '../CommentEditor'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

const ARTICLE_COMMENTS_PAGE_SIZE = 50
const MAX_COMMENT_LEVEL = 6

export const CommentsTree = (props: { shoutSlug: string; shoutId: number }) => {
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
  const getCommentById = (cid: number) => reactions().find((r: Reaction) => r.id === cid)
  const getCommentLevel = (c: Reaction, level = 0) => {
    if (c && c.replyTo && level < MAX_COMMENT_LEVEL) {
      return getCommentLevel(getCommentById(c.replyTo), level + 1)
    }
    return level
  }
  onMount(async () => await loadMore())

  const [loading, setLoading] = createSignal<boolean>(false)
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null)
  const handleSubmitComment = async (value) => {
    console.log('!!! value:', value)
    try {
      setLoading(true)
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
      setLoading(false)
    } catch (error) {
      setErrorMessage(t('Something went wrong, please try again'))
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
          <For
            each={reactions()
              .reverse()
              .filter((r) => !r.replyTo)}
          >
            {(reaction) => <Comment reactions={reactions()} comment={reaction} />}
          </For>
        </ul>
        <Show when={isLoadMoreButtonVisible()}>
          <button onClick={loadMore}>{t('Load more')}</button>
        </Show>

        <ShowOnlyOnClient>
          <CommentEditor
            initialValue={''}
            onCancel={() => {}}
            onSubmit={(value) => handleSubmitComment(value)}
          />
        </ShowOnlyOnClient>

        {/*<GrowingTextarea*/}
        {/*  placeholder={t('Write comment')}*/}
        {/*  submitButtonText={t('Send')}*/}
        {/*  cancelButtonText={t('cancel')}*/}
        {/*  submit={(value) => handleSubmitComment(value)}*/}
        {/*  loading={loading()}*/}
        {/*  errorMessage={errorMessage()}*/}
        {/*/>*/}
      </Show>
    </div>
  )
}
