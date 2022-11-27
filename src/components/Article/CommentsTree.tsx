import { For, Show } from 'solid-js/web'
import { useSession } from '../../context/session'
import Comment from './Comment'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import styles from '../../styles/Article.module.scss'
import { useReactionsStore } from '../../stores/zine/reactions'
import { createEffect, createMemo, createSignal, onMount, Suspense } from 'solid-js'
import type { Reaction } from '../../graphql/types.gen'
import { clsx } from 'clsx'

const ARTICLE_COMMENTS_PAGE_SIZE = 50
const MAX_COMMENT_LEVEL = 6

export const CommentsTree = (props: { shout: string; reactions?: Reaction[] }) => {
  const [getCommentsPage, setCommentsPage] = createSignal(0)
  const [isCommentsLoading, setIsCommentsLoading] = createSignal(false)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const { session } = useSession()
  const { sortedReactions, loadReactionsBy } = useReactionsStore({ reactions: props.reactions })
  const reactions = createMemo<Reaction[]>(() => sortedReactions()) // .filter(r => r.shout.slug === props.shout) )
  const loadMore = async () => {
    try {
      const page = getCommentsPage()
      setIsCommentsLoading(true)

      const { hasMore } = await loadReactionsBy({
        by: { shout: props.shout, comment: true },
        limit: ARTICLE_COMMENTS_PAGE_SIZE,
        offset: page * ARTICLE_COMMENTS_PAGE_SIZE
      })
      setIsLoadMoreButtonVisible(hasMore)
    } finally {
      setIsCommentsLoading(false)
    }
  }
  const getCommentById = (cid) => reactions().find((r) => r.id === cid)
  const getCommentLevel = (c: Reaction, level = 0) => {
    if (c && c.replyTo && level < MAX_COMMENT_LEVEL) {
      return getCommentLevel(getCommentById(c.replyTo), level + 1)
    }
    return level
  }
  onMount(async () => await loadMore())
  return (
    <>
      <Show when={reactions()}>
        <div class={styles.commentsHeaderWrapper}>
          <h2 id="comments" class={styles.commentsHeader}>
            {t('Comments')} {reactions().length.toString() || ''}
          </h2>

          <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
            <li class="selected">
              <a href="#">По порядку</a>
            </li>
            <li>
              <a href="#">По рейтингу</a>
            </li>
          </ul>
        </div>

        <form class={styles.commentForm}>
          <div class="pretty-form__item">
            <input type="text" id="new-comment" placeholder="Коментарий" />
            <label for="new-comment">Коментарий</label>
          </div>
        </form>

        <For each={reactions()}>
          {(reaction: Reaction) => (
            <Comment
              comment={reaction}
              level={getCommentLevel(reaction)}
              canEdit={reaction.createdBy?.slug === session()?.user?.slug}
            />
          )}
        </For>

        <Show when={isLoadMoreButtonVisible()}>
          <button onClick={loadMore}>Load more</button>
        </Show>
      </Show>

      <Show
        when={!session()?.user?.slug}
        fallback={<textarea class={styles.writeComment} rows="1" placeholder={t('Write comment')} />}
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
