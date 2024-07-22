import { useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { Show, createEffect, createMemo, createSignal, on } from 'solid-js'
import { byCreated } from '~/lib/sort'
import { useLocalize } from '../../context/localize'
import { RATINGS_PER_PAGE, useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { useSnackbar } from '../../context/ui'
import { Reaction, ReactionKind, Shout } from '../../graphql/schema/core.gen'
import { Icon } from '../_shared/Icon'
import { InlineLoader } from '../_shared/InlineLoader'
import { LoadMoreItems, LoadMoreWrapper } from '../_shared/LoadMoreWrapper'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'
import stylesComment from './CommentRatingControl.module.scss'
import stylesShout from './ShoutRatingControl.module.scss'

interface RatingControlProps {
  shout?: Shout
  comment?: Reaction
  class?: string
}

export const RatingControl = (props: RatingControlProps) => {
  const { t, lang } = useLocalize()
  const [_, changeSearchParams] = useSearchParams()
  const snackbar = useSnackbar()
  const { session } = useSession()
  const { reactionEntities, reactionsByShout, createReaction, deleteReaction, loadShoutRatings, loadCommentRatings } =
    useReactions()
  const [myRate, setMyRate] = createSignal<Reaction | undefined>()
  const [ratingReactions, setRatingReactions] = createSignal<Reaction[]>([])
  const [isLoading, setIsLoading] = createSignal(false)

  // reaction kind
  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === session()?.user?.app_data?.profile?.slug &&
        r.shout.id === props.comment?.shout.id &&
        r.reply_to === props.comment?.id
    )
  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))
  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))

  createEffect(() => {
    const shout = props.comment?.shout.id || props.shout?.id
    if (shout && !ratingReactions()) {
      let result = Object.values(reactionEntities).filter(
        (r) => [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) && r.shout.id === shout
      )
      if (props.comment?.id) result = result.filter((r) => r.reply_to === props.comment?.id)
      setRatingReactions(result)
    }
  })

  const deleteRating = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === session()?.user?.nickname &&
        r.shout.id === props.comment?.shout.id &&
        r.reply_to === props.comment?.id
    )
    return reactionToDelete && deleteReaction(reactionToDelete.id)
  }

  // rating change
  const handleRatingChange = async (isUpvote: boolean) => {
    setIsLoading(true)
    let error = ''
    try {
      if (isUpvoted() && isUpvote) return
      if (isDownvoted() && !isUpvote) return
      if (isUpvoted() && !isUpvote) error = (await deleteRating(ReactionKind.Like))?.error || ''
      if (isDownvoted() && isUpvote) error = (await deleteRating(ReactionKind.Dislike))?.error || ''
      if (!(isUpvoted() || isDownvoted())) {
        props.comment?.shout.id &&
          (await createReaction({
            reaction: {
              kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
              shout: props.comment.shout.id,
              reply_to: props.comment?.id
            }
          }))
      }
    } catch(err) {
      snackbar?.showSnackbar({ type: 'error', body: `${t('Error')}: ${error || err || ''}` })
    }
    setIsLoading(false)
  }

  const total = createMemo<number>(() =>
    props.comment?.stat?.rating ? props.comment.stat.rating : props.shout?.stat?.rating || 0
  )

  createEffect(
    on(
      [ratingReactions, () => session()?.user?.app_data?.profile],
      ([reactions, me]) => {
        console.debug('[RatingControl] on reactions update')
        const ratingVotes = Object.values(reactions).filter((r) => !r.reply_to)
        setRatingReactions((_) => ratingVotes.sort(byCreated))
        const myReaction = reactions.find((r) => r.created_by.id === me?.id)
        setMyRate((_) => myReaction)
      },
      { defer: true }
    )
  )

  const getTrigger = createMemo(() => {
    return (
      <div
        class={clsx(stylesComment.commentRatingValue, {
          [stylesComment.commentRatingPositive]: total() > 0 && Boolean(props.comment?.id),
          [stylesComment.commentRatingNegative]: total() < 0 && Boolean(props.comment?.id),
          [stylesShout.ratingValue]: !props.comment?.id
        })}
      >
        {total()}
      </div>
    )
  })
  const VOTERS_PER_PAGE = 10
  const [ratingPage, setRatingPage] = createSignal(0)
  const [ratingLoading, setRatingLoading] = createSignal(false) // FIXME: use loading indication
  const ratings = createMemo(() =>
    props.shout
      ? reactionsByShout[props.shout?.slug]?.filter(
          (r) => r.kind === ReactionKind.Like || r.kind === ReactionKind.Dislike
        )
      : []
  )
  const loadMoreReactions = async () => {
    if (!(props.shout?.id || props.comment?.id)) return [] as LoadMoreItems
    setRatingLoading(true)
    const next = ratingPage() + 1
    const offset = RATINGS_PER_PAGE * next
    const loader = props.comment ? loadCommentRatings : loadShoutRatings
    const rrr = await loader(props.shout?.id || 0, RATINGS_PER_PAGE, offset)
    rrr && setRatingPage(next)
    setRatingLoading(false)
    return rrr as LoadMoreItems
  }
  return props.comment?.id ? (
    <div class={stylesComment.commentRating}>
      <button
        role="button"
        disabled={!session()?.user?.app_data?.profile}
        onClick={() => handleRatingChange(true)}
        class={clsx(stylesComment.commentRatingControl, stylesComment.commentRatingControlUp, {
          [stylesComment.voted]: isUpvoted()
        })}
      />
      <Popup
        trigger={
          <div
            class={clsx(stylesComment.commentRatingValue, {
              [stylesComment.commentRatingPositive]: (props.comment?.stat?.rating || 0) > 0,
              [stylesComment.commentRatingNegative]: (props.comment?.stat?.rating || 0) < 0
            })}
          >
            {props.comment?.stat?.rating || 0}
          </div>
        }
        variant="tiny"
      >
        <Show when={ratingLoading()}>
          <InlineLoader />
        </Show>
        <LoadMoreWrapper
          loadFunction={loadMoreReactions}
          pageSize={VOTERS_PER_PAGE}
          hidden={ratingLoading()}
        >
          <VotersList reactions={ratings()} fallbackMessage={t('This comment has not been rated yet')} />
        </LoadMoreWrapper>
      </Popup>
      <button
        role="button"
        disabled={!session()?.user?.app_data?.profile}
        onClick={() => handleRatingChange(false)}
        class={clsx(stylesComment.commentRatingControl, stylesComment.commentRatingControlDown, {
          [stylesComment.voted]: isDownvoted()
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
                [stylesComment.voted]: myRate()?.kind === 'LIKE'
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
          when={!!session()?.user?.app_data?.profile}
          fallback={
            <>
              <span class="link" onClick={() => changeSearchParams({ mode: 'login', m: 'auth' })}>
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
                [stylesComment.voted]: myRate()?.kind === 'DISLIKE'
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
