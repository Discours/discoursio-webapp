import { clsx } from 'clsx'
import { Show, createEffect, createMemo, createSignal, mergeProps, on } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { Reaction, ReactionKind, Shout } from '../../graphql/schema/core.gen'
import { loadShout } from '../../stores/zine/articles'
import { byCreated } from '../../utils/sortby'
import { Icon } from '../_shared/Icon'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'

import { useRouter } from '../../stores/router'
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
  const { author, requireAuthentication } = useSession()
  const { reactionEntities, createReaction, deleteReaction, loadReactionsBy } = useReactions()
  const [isLoading, setIsLoading] = createSignal(false)
  const [ratings, setRatings] = createSignal<Reaction[]>([])
  const [myRate, setMyRate] = createSignal<Reaction | undefined>()
  const [total, setTotal] = createSignal(props.comment?.stat?.rating || props.shout?.stat?.rating || 0)

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
      [() => props.ratings, author],
      ([reactions, me]) => {
        console.debug('[RatingControl] on reactions update')
        const ratingVotes = Object.values(reactions).filter((r) => !r.reply_to)
        setRatings((_) => ratingVotes.sort(byCreated))
        setMyRate((_) => ratingVotes.find((r) => r.created_by.id === me?.id))

        // Extract likes and dislikes from shoutRatings using map
        const likes = ratingVotes.filter((rating) => rating.kind === 'LIKE').length
        const dislikes = ratingVotes.filter((rating) => rating.kind === 'DISLIKE').length

        // Calculate the total
        const total = likes - dislikes
        setTotal(total)
      },
      { defer: true },
    ),
  )

  const handleRatingChange = (voteKind: ReactionKind) => {
    requireAuthentication(async () => {
      setIsLoading(true)

      if (!myRate()) {
        console.debug('[RatingControl.handleRatingChange] wasnt voted by you before', myRate())
        const rateInput = { kind: voteKind, shout: props.shout?.id }
        const fakeId = Date.now() + Math.floor(Math.random() * 1000)
        // const savedRatings = [...props.ratings]
        mergeProps(props.ratings, [...props.ratings, { ...rateInput, id: fakeId, created_by: author() }])
        const _ = await createReaction(rateInput)
      } else {
        console.debug('[RatingControl.handleRatingChange] already has your vote', myRate())
        const oppositeKind = voteKind === ReactionKind.Like ? ReactionKind.Dislike : ReactionKind.Like
        if (myRate()?.kind === oppositeKind) {
          mergeProps(
            props.ratings,
            props.ratings.filter((r) => r.id === myRate().id),
          )
          await deleteReaction(myRate().id)
          setMyRate(undefined)
          console.debug(`[RatingControl.handleRatingChange] your ${oppositeKind} vote was removed`)
        }
        if (myRate()?.kind === voteKind) {
          console.debug(`[RatingControl.handleRatingChange] cant vote ${voteKind} twice`)
        }
      }

      const ratings = await loadReactionsBy({ by: { shout: props.shout?.slug, rating: true } })
      mergeProps(props.ratings, ratings)
      const s = await loadShout(props.shout?.slug)
      mergeProps(props.shout, s)
      setIsLoading(false)
    }, 'vote')
  }

  const isNotDisliked = createMemo(() => !myRate() || myRate()?.kind === ReactionKind.Dislike)
  const isNotLiked = createMemo(() => !myRate() || myRate()?.kind === ReactionKind.Like)

  const getTrigger = createMemo(() => {
    return props.comment ? (
      <div
        class={clsx(stylesComment.commentRatingValue, {
          [stylesComment.commentRatingPositive]: total() > 0,
          [stylesComment.commentRatingNegative]: total() < 0,
        })}
      >
        {total()}
      </div>
    ) : (
      <span class={stylesShout.ratingValue}>{total()}</span>
    )
  })

  return (
    <div class={clsx(props.comment ? stylesComment.commentRating : stylesShout.rating, props.class)}>
      <button
        onClick={() => handleRatingChange(ReactionKind.Dislike)}
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
            name={isNotDisliked() ? 'rating-control-less' : 'rating-control-checked'}
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
            reactions={ratings()}
            fallbackMessage={isLoading() ? t('Loading') : t('No one rated yet')}
          />
        </Show>
      </Popup>
      <button
        onClick={() => handleRatingChange(ReactionKind.Like)}
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
            name={isNotLiked() ? 'rating-control-more' : 'rating-control-checked'}
            class={isLoading() ? 'rotating' : ''}
          />
        </Show>
      </button>
    </div>
  )
}
