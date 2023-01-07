import { For, Show, createMemo, createSignal, onMount, createEffect } from 'solid-js'
import { useSession } from '../../context/session'
import { Comment } from './Comment'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import styles from '../../styles/Article.module.scss'
import { useReactionsStore } from '../../stores/zine/reactions'
import type { Reaction } from '../../graphql/types.gen'
import { clsx } from 'clsx'
import { byCreated, byStat } from '../../utils/sortby'
import { Loading } from '../Loading'

const ARTICLE_COMMENTS_PAGE_SIZE = 50
const MAX_COMMENT_LEVEL = 6

export const CommentsTree = (props: { shoutSlug: string }) => {
  const [getCommentsPage, setCommentsPage] = createSignal(0)
  const [commentsOrder, setCommentsOrder] = createSignal<'rating' | 'createdAt'>('createdAt')
  const [isCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const { session } = useSession()
  const { sortedReactions, loadReactionsBy } = useReactionsStore()
  const reactions = createMemo<Reaction[]>(() =>
    sortedReactions().sort(commentsOrder() === 'rating' ? byStat('rating') : byCreated)
  )

  createEffect(() => {
    console.log('!!! sortedReactions():', sortedReactions())
  })
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
          <For each={reactions().filter((r) => !r.replyTo)}>
            {(reaction) => <Comment reactions={reactions()} comment={reaction} />}
          </For>
        </ul>

        <Show when={isLoadMoreButtonVisible()}>
          <button onClick={loadMore}>{t('Load more')}</button>
        </Show>
      </Show>

      <Show
        when={!session()?.user?.slug}
        fallback={
          <form class={styles.commentForm}>
            <div class="pretty-form__item">
              <input type="text" id="new-comment" placeholder={t('Write comment')} />
              <label for="new-comment">{t('Write comment')}</label>
            </div>
          </form>
        }
      >
        <div class={styles.commentWarning} id="comments">
          {t('To leave a comment you please')}
          <a
            href={''}
            onClick={(evt) => {
              evt.preventDefault()
              showModal('auth')
            }}
          >
            <i>{t('sign up or sign in')}</i>
          </a>
        </div>
      </Show>
    </>
  )
}
