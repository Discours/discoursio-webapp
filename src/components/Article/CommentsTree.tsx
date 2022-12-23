import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import { useSession } from '../../context/session'
import Comment from './Comment'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import styles from '../../styles/Article.module.scss'
import { useReactionsStore } from '../../stores/zine/reactions'
import type { Reaction } from '../../graphql/types.gen'
import { clsx } from 'clsx'
import { byCreated, byStat } from '../../utils/sortby'
import { Loading } from '../Loading'

type NestedReaction = {
  children: Reaction[] | []
} & Reaction

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
    sortedReactions()
      .sort(commentsOrder() === 'rating' ? byStat('rating') : byCreated)
      .filter((r) => r.shout.slug === props.shoutSlug)
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
  const getCommentById = (cid: number) => reactions().find((r: Reaction) => r.id === cid)
  const getCommentLevel = (c: Reaction, level = 0) => {
    if (c && c.replyTo && level < MAX_COMMENT_LEVEL) {
      return getCommentLevel(getCommentById(c.replyTo), level + 1)
    }
    return level
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

  createEffect(() => {
    console.log('!!! re:', nestComments(reactions()))
  })

  // const treeItems = () => {
  //   return nestComments(reactions().reverse()).map((comment) => {
  //     return (
  //       <>
  //         <Comment
  //           comment={comment}
  //           parent={comment.id}
  //         />
  //         {comment.children && treeItems(comment.children)}
  //       </>
  //     )
  //   })
  // }

  // createEffect(() => {
  //   console.log('!!! :')
  // })
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
          <For each={nestComments(reactions().reverse())}>
            {(reaction: NestedReaction) => (
              <Comment
                comment={reaction}
                parent={reaction.id}
                level={getCommentLevel(reaction)}
                canEdit={reaction?.createdBy?.slug === session()?.user?.slug}
                // children={(reaction.children).map((r) => {
                //   return <Comment comment={r} parent={reaction.id} />
                // })}
              />
            )}
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
            <div>
              <button class="button button--light">{t('cancel')}</button>
              <button type="submit" class="button button-sm">
                {t('Send')}
              </button>
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
