import { clsx } from 'clsx'
import { For, Show, createMemo, createSignal, lazy, onMount } from 'solid-js'

import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { useReactions } from '~/context/reactions'
import { useSession } from '~/context/session'
import {
  QueryLoad_Reactions_ByArgs,
  Reaction,
  ReactionKind,
  ReactionSort,
  Shout
} from '~/graphql/schema/core.gen'
import { byCreated, byStat } from '~/lib/sort'
import { SortFunction } from '~/types/common'
import { Button } from '../_shared/Button'
import { InlineLoader } from '../_shared/InlineLoader'
import { LoadMoreItems, LoadMoreWrapper } from '../_shared/LoadMoreWrapper'
import { ShowIfAuthenticated } from '../_shared/ShowIfAuthenticated'
import styles from './Article.module.scss'
import { Comment } from './Comment'

const SimplifiedEditor = lazy(() => import('../Editor/SimplifiedEditor'))

type Props = {
  shout: Shout
}
const COMMENTS_PER_PAGE = 50

export const CommentsTree = (props: Props) => {
  const { session } = useSession()
  const { t } = useLocalize()
  const { reactionEntities, createReaction, loadReactionsBy, addReactions } = useReactions()
  const { seen } = useFeed()
  const [commentsOrder, setCommentsOrder] = createSignal<ReactionSort>(ReactionSort.Newest)
  const [onlyNew, setOnlyNew] = createSignal(false)
  const [newReactions, setNewReactions] = createSignal<Reaction[]>([])
  const [clearEditor, setClearEditor] = createSignal(false)
  const [clickedReplyId, setClickedReplyId] = createSignal<number>()

  const shoutLastSeen = createMemo(() => seen()[props.shout.slug] ?? 0)
  const comments = createMemo(() =>
    Object.values(reactionEntities).filter((reaction) => reaction.kind === 'COMMENT')
  )

  const sortedComments = createMemo(() => {
    let newSortedComments = [...comments()]
    newSortedComments = newSortedComments.sort(byCreated)

    if (onlyNew()) {
      return newReactions().sort(byCreated).reverse()
    }

    if (commentsOrder() === ReactionSort.Like) {
      newSortedComments = newSortedComments.sort(byStat('rating') as SortFunction<Reaction>)
    }
    return newSortedComments
  })
  onMount(() => {
    const currentDate = new Date()
    const setCookie = () => localStorage?.setItem(`${props.shout.slug}`, `${currentDate}`)
    if (!shoutLastSeen()) {
      setCookie()
    } else if (currentDate.getTime() > shoutLastSeen()) {
      const newComments = comments().filter((c) => {
        if (
          (session()?.user?.app_data?.profile?.id && c.reply_to) ||
          c.created_by.id === session()?.user?.app_data?.profile?.id
        ) {
          return
        }
        return (c.updated_at || c.created_at) > shoutLastSeen()
      })
      setNewReactions(newComments)
      setCookie()
    }
  })
  const [posting, setPosting] = createSignal(false)
  const [commentsLoading, setCommentsLoading] = createSignal(false)
  const [pagination, setPagination] = createSignal(0)
  const loadMoreComments = async () => {
    setCommentsLoading(true)
    const next = pagination() + 1
    const offset = next * COMMENTS_PER_PAGE
    const opts: QueryLoad_Reactions_ByArgs = {
      by: { comment: true, shout: props.shout.slug },
      limit: COMMENTS_PER_PAGE,
      offset
    }
    const rrr = await loadReactionsBy(opts)
    rrr && addReactions(rrr)
    rrr && setPagination(next)
    setCommentsLoading(false)
    return rrr as LoadMoreItems
  }

  const handleSubmitComment = async (value: string) => {
    setPosting(true)
    try {
      await createReaction({
        reaction: {
          kind: ReactionKind.Comment,
          body: value,
          shout: props.shout.id
        }
      })
      setClearEditor(true)
      await loadMoreComments()
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
    setClearEditor(false)
    setPosting(false)
  }
  return (
    <>
      <div class={styles.commentsHeaderWrapper}>
        <h2 class={styles.commentsHeader}>
          {t('Comments')} {comments().length.toString() || ''}
          <Show when={newReactions().length > 0}>
            <span class={styles.newReactions}>{` +${newReactions().length}`}</span>
          </Show>
        </h2>
        <Show when={comments().length > 0}>
          <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
            <Show when={newReactions().length > 0}>
              <li classList={{ 'view-switcher__item--selected': onlyNew() }}>
                <Button variant="light" value={t('New only')} onClick={() => setOnlyNew(!onlyNew())} />
              </li>
            </Show>
            <li classList={{ 'view-switcher__item--selected': commentsOrder() === ReactionSort.Newest }}>
              <Button
                variant="light"
                value={t('By time')}
                onClick={() => {
                  setCommentsOrder(ReactionSort.Newest)
                }}
              />
            </li>
            <li classList={{ 'view-switcher__item--selected': commentsOrder() === ReactionSort.Like }}>
              <Button
                variant="light"
                value={t('By rating')}
                onClick={() => {
                  setCommentsOrder(ReactionSort.Like)
                }}
              />
            </li>
          </ul>
        </Show>
      </div>
      <Show when={commentsLoading()}>
        <InlineLoader />
      </Show>
      <LoadMoreWrapper
        loadFunction={loadMoreComments}
        pageSize={COMMENTS_PER_PAGE}
        hidden={commentsLoading() || comments().length >= (props.shout?.stat?.commented || 0)}
      >
        <ul class={styles.comments}>
          <For each={sortedComments().filter((r) => !r.reply_to)}>
            {(reaction) => (
              <Comment
                sortedComments={sortedComments()}
                isArticleAuthor={props.shout.authors?.some((a) => a && reaction.created_by.id === a.id)}
                comment={reaction}
                clickedReply={(id) => setClickedReplyId(id)}
                clickedReplyId={clickedReplyId()}
                lastSeen={shoutLastSeen()}
              />
            )}
          </For>
        </ul>
      </LoadMoreWrapper>
      <ShowIfAuthenticated
        fallback={
          <div class={styles.signInMessage}>
            {t('To write a comment, you must')}{' '}
            <a href="?m=auth&mode=register" class={styles.link}>
              {t('sign up')}
            </a>{' '}
            {t('or')}{' '}
            <a href="?m=auth&mode=login" class={styles.link}>
              {t('sign in')}
            </a>
          </div>
        }
      >
        <SimplifiedEditor
          quoteEnabled={true}
          imageEnabled={true}
          autoFocus={false}
          submitByCtrlEnter={true}
          placeholder={t('Write a comment...')}
          onSubmit={(value) => handleSubmitComment(value)}
          setClear={clearEditor()}
          isPosting={posting()}
        />
      </ShowIfAuthenticated>
    </>
  )
}
