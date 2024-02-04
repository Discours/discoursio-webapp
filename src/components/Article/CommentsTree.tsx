import { clsx } from 'clsx'
import { Show, createMemo, createSignal, onMount, For, lazy } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { Author, Reaction, ReactionKind } from '../../graphql/schema/core.gen'
import { byCreated } from '../../utils/sortby'
import { Button } from '../_shared/Button'
import { ShowIfAuthenticated } from '../_shared/ShowIfAuthenticated'

import { Comment } from './Comment'

import styles from './Article.module.scss'

const SimplifiedEditor = lazy(() => import('../Editor/SimplifiedEditor'))

type CommentsOrder = 'createdAt' | 'rating' | 'newOnly'

const sortCommentsByRating = (a: Reaction, b: Reaction): -1 | 0 | 1 => {
  if (a.reply_to && b.reply_to) {
    return 0
  }

  const x = a.stat?.rating || 0
  const y = b.stat?.rating || 0

  if (x > y) {
    return 1
  }

  if (x < y) {
    return -1
  }

  return 0
}

type Props = {
  articleAuthors: Author[]
  shoutSlug: string
  shoutId: number
}

export const CommentsTree = (props: Props) => {
  const { author } = useSession()
  const { t } = useLocalize()
  const [commentsOrder, setCommentsOrder] = createSignal<CommentsOrder>('createdAt')
  const [newReactions, setNewReactions] = createSignal<Reaction[]>([])
  const [clearEditor, setClearEditor] = createSignal(false)
  const [clickedReplyId, setClickedReplyId] = createSignal<number>()

  const {
    reactionEntities,
    actions: { createReaction },
  } = useReactions()

  const comments = createMemo(() =>
    Object.values(reactionEntities).filter((reaction) => reaction.kind === 'COMMENT'),
  )

  const sortedComments = createMemo(() => {
    let newSortedComments = [...comments()]
    newSortedComments = newSortedComments.sort(byCreated)

    if (commentsOrder() === 'newOnly') {
      return newReactions().reverse()
    }

    if (commentsOrder() === 'rating') {
      newSortedComments = newSortedComments.sort(sortCommentsByRating)
    }

    newSortedComments.reverse()

    return newSortedComments
  })

  const dateFromLocalStorage = Number.parseInt(localStorage.getItem(`${props.shoutSlug}`))
  const currentDate = new Date()
  const setCookie = () => localStorage.setItem(`${props.shoutSlug}`, `${currentDate}`)

  onMount(() => {
    if (!dateFromLocalStorage) {
      setCookie()
    } else if (currentDate.getTime() > dateFromLocalStorage) {
      const newComments = comments().filter((c) => {
        if (c.reply_to || c.created_by.slug === author()?.slug) {
          return
        }
        const created = c.created_at
        return created > dateFromLocalStorage
      })
      setNewReactions(newComments)
      setCookie()
    }
  })
  const handleSubmitComment = async (value) => {
    try {
      await createReaction({
        kind: ReactionKind.Comment,
        body: value,
        shout: props.shoutId,
      })
      setClearEditor(true)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
    setClearEditor(false)
  }

  return (
    <>
      <div class={styles.commentsHeaderWrapper}>
        <h2 class={styles.commentsHeader}>
          {t('Comments')} {comments().length.toString() || ''}
          <Show when={newReactions().length > 0}>
            <span class={styles.newReactions}>&nbsp;+{newReactions().length}</span>
          </Show>
        </h2>
        <Show when={comments().length > 0}>
          <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
            <Show when={newReactions().length > 0}>
              <li classList={{ 'view-switcher__item--selected': commentsOrder() === 'newOnly' }}>
                <Button
                  variant="light"
                  value={t('New only')}
                  onClick={() => {
                    setCommentsOrder('newOnly')
                  }}
                />
              </li>
            </Show>
            <li classList={{ 'view-switcher__item--selected': commentsOrder() === 'createdAt' }}>
              <Button
                variant="light"
                value={t('By time')}
                onClick={() => {
                  setCommentsOrder('createdAt')
                }}
              />
            </li>
            <li classList={{ 'view-switcher__item--selected': commentsOrder() === 'rating' }}>
              <Button
                variant="light"
                value={t('By rating')}
                onClick={() => {
                  setCommentsOrder('rating')
                }}
              />
            </li>
          </ul>
        </Show>
      </div>
      <ul class={styles.comments}>
        <For each={sortedComments().filter((r) => !r.reply_to)}>
          {(reaction) => (
            <Comment
              sortedComments={sortedComments()}
              isArticleAuthor={Boolean(
                props.articleAuthors.some((a) => a?.slug === reaction.created_by.slug),
              )}
              comment={reaction}
              clickedReply={(id) => setClickedReplyId(id)}
              clickedReplyId={clickedReplyId()}
              lastSeen={dateFromLocalStorage}
            />
          )}
        </For>
      </ul>
      <ShowIfAuthenticated
        fallback={
          <div class={styles.signInMessage}>
            {t('To write a comment, you must')}{' '}
            <a href="?m=auth&mode=register" class={styles.link}>
              {t('sign up')}
            </a>{' '}
            {t('or')}&nbsp;
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
        />
      </ShowIfAuthenticated>
    </>
  )
}
