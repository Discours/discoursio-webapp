import { clsx } from 'clsx'
import { Show, createEffect, createMemo, createSignal, on } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { useSnackbar } from '../../context/snackbar'
import { Reaction, ReactionKind, Shout } from '../../graphql/schema/core.gen'
import { useRouter } from '../../stores/router'
import { loadShout } from '../../stores/zine/articles'
import { byCreated } from '../../utils/sortby'
import { Icon } from '../_shared/Icon'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'
import stylesComment from './CommentRatingControl.module.scss'
import stylesShout from './ShoutRatingControl.module.scss'

interface RatingControlProps {
  shout?: Shout
  comment?: Reaction
  ratings?: Reaction[]
  class?: string
}

export const RatingControl = (props: RatingControlProps) => {
  const { t, lang } = useLocalize()
  const { changeSearchParams } = useRouter()
  const snackbar = useSnackbar()
  const { author } = useSession()
  const { reactionEntities, createReaction, deleteReaction, loadReactionsBy } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === author()?.slug &&
        r.shout.id === props.comment.shout.id &&
        r.reply_to === props.comment.id,
    )
  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))
  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))
  const [myRate, setMyRate] = createSignal<Reaction | undefined>()
  const [total, setTotal] = createSignal(props.comment?.stat?.rating || props.shout?.stat?.rating || 0)

  const [ratingReactions, setRatingReactions] = createSignal<Reaction[]>([])
  createEffect(() => {
    const shout = props.comment.shout.id || props.shout.id
    if (shout && !ratingReactions()) {
      let result = Object.values(reactionEntities).filter(
        (r) => [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) && r.shout.id === shout,
      )
      if (props.comment?.id) result = result.filter((r) => r.reply_to === props.comment.id)
      setRatingReactions(result)
    }
  })

  const deleteRating = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === author()?.slug &&
        r.shout.id === props.comment.shout.id &&
        r.reply_to === props.comment.id,
    )
    return deleteReaction(reactionToDelete.id)
  }

  const [isLoading, setIsLoading] = createSignal(false)
  const handleRatingChange = async (isUpvote: boolean) => {
    setIsLoading(true)
    try {
      if (isUpvoted()) {
        await deleteRating(ReactionKind.Like)
      } else if (isDownvoted()) {
        await deleteRating(ReactionKind.Dislike)
      } else {
        await createReaction({
          kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
          shout: props.comment.shout.id,
          reply_to: props.comment.id,
        })
      }
    } catch {
      snackbar?.showSnackbar({ type: 'error', body: t('Error') })
    }

    await loadShout(props.comment.shout.slug)
    await loadReactionsBy({
      by: { shout: props.comment.shout.slug },
    })
    setIsLoading(false)
  }

  createEffect(
    on(
      () => props.comment,
      (comment) => {
        if (comment) {
          setTotal(comment?.stat?.rating)
        }
      },
      { defer: true },
    ),
  )

  createEffect(
    on(
      () => props.shout,
      (shout) => {
        if (shout) {
          setTotal(shout.stat?.rating)
        }
      },
      { defer: true },
    ),
  )
  createEffect(
    on(
      () => reactionEntities,
      (reactions) => {
        const ratings = Object.values(reactions).filter((r) => !r?.reply_to)
        const likes = ratings.filter((rating) => rating.kind === 'LIKE').length
        const dislikes = ratings.filter((rating) => rating.kind === 'DISLIKE').length
        const total = likes - dislikes
        setTotal(total)
      },
      { defer: true },
    ),
  )

  createEffect(
    on(
      [ratingReactions, author],
      ([reactions, me]) => {
        console.debug('[RatingControl] on reactions update')
        const ratingVotes = Object.values(reactions).filter((r) => !r.reply_to)
        setRatingReactions((_) => ratingVotes.sort(byCreated))
        const myReaction = reactions.find((r) => r.created_by.id === me?.id)
        setMyRate((_) => myReaction)
      },
      { defer: true },
    ),
  )

  const getTrigger = createMemo(() => {
    return (
      <div
        class={clsx(stylesComment.commentRatingValue, {
          [stylesComment.commentRatingPositive]: total() > 0 && Boolean(props.comment?.id),
          [stylesComment.commentRatingNegative]: total() < 0 && Boolean(props.comment?.id),
          [stylesShout.ratingValue]: !props.comment?.id,
        })}
      >
        {total()}
      </div>
    )
  })

  return props.comment?.id ? (
    <div class={stylesComment.commentRating}>
      <button
        role="button"
        disabled={!author()}
        onClick={() => handleRatingChange(true)}
        class={clsx(stylesComment.commentRatingControl, stylesComment.commentRatingControlUp, {
          [stylesComment.voted]: isUpvoted(),
        })}
      />
      <Popup
        trigger={
          <div
            class={clsx(stylesComment.commentRatingValue, {
              [stylesComment.commentRatingPositive]: props.comment.stat.rating > 0,
              [stylesComment.commentRatingNegative]: props.comment.stat.rating < 0,
            })}
          >
            {props.comment.stat.rating || 0}
          </div>
        }
        variant="tiny"
      >
        <VotersList
          reactions={ratingReactions()}
          fallbackMessage={t('This comment has not yet been rated')}
        />
      </Popup>
      <button
        role="button"
        disabled={!author()}
        onClick={() => handleRatingChange(false)}
        class={clsx(stylesComment.commentRatingControl, stylesComment.commentRatingControlDown, {
          [stylesComment.voted]: isDownvoted(),
        })}
      />
    </div>
  ) : (
    <div class={clsx(props.comment ? stylesComment.commentRating : stylesShout.rating, props.class)}>
      <button
        onClick={() => handleRatingChange(false)}
        disabled={isLoading()}
        class={
          props.comment
            ? clsx(stylesComment.commentRatingControl, stylesComment.commentRatingControlUp, {
                [stylesComment.voted]: myRate()?.kind === 'LIKE',
              })
            : ''
        }
      >
        <Show when={!props.comment}>
          <Icon
            name={isDownvoted() ? 'rating-control-checked' : 'rating-control-less'}
            class={isLoading() ? 'rotating' : ''}
          />
        </Show>
      </button>
      <Popup trigger={getTrigger()} variant="tiny">
        <Show
          when={author()}
          fallback={
            <>
              <span class="link" onClick={() => changeSearchParams({ mode: 'login', modal: 'auth' })}>
                {t('Enter')}
              </span>
              {lang() === 'ru' ? ', ' : ' '}
              {t('to see the voters')}
            </>
          }
        >
          <VotersList
            reactions={ratingReactions()}
            fallbackMessage={isLoading() ? t('Loading') : t('No one rated yet')}
          />
        </Show>
      </Popup>
      <button
        onClick={() => handleRatingChange(true)}
        disabled={isLoading()}
        class={
          props.comment
            ? clsx(stylesComment.commentRatingControl, stylesComment.commentRatingControlDown, {
                [stylesComment.voted]: myRate()?.kind === 'DISLIKE',
              })
            : ''
        }
      >
        <Show when={!props.comment}>
          <Icon
            name={isUpvoted() ? 'rating-control-checked' : 'rating-control-more'}
            class={isLoading() ? 'rotating' : ''}
          />
        </Show>
      </button>
    </div>
  )
}
