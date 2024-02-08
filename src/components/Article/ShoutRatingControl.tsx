import { clsx } from 'clsx'
import { Show, Suspense, createEffect, createMemo, createSignal, mergeProps, on } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { Author, Reaction, ReactionKind, Shout } from '../../graphql/schema/core.gen'
import { loadShout } from '../../stores/zine/articles'
import { byCreated } from '../../utils/sortby'
import { Icon } from '../_shared/Icon'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'
import styles from './ShoutRatingControl.module.scss'

interface ShoutRatingControlProps {
  shout: Shout
  ratings?: Reaction[]
  class?: string
}

export const ShoutRatingControl = (props: ShoutRatingControlProps) => {
  const { t } = useLocalize()
  const { author, requireAuthentication } = useSession()
  const { createReaction, deleteReaction, loadReactionsBy } = useReactions()
  const [isLoading, setIsLoading] = createSignal(false)
  const [ratings, setRatings] = createSignal<Reaction[]>([])
  const [myRate, setMyRate] = createSignal<Reaction | undefined>()
  const [total, setTotal] = createSignal(props.shout?.stat?.rating || 0)

  createEffect(
    on(
      [() => props.ratings, author],
      ([reactions, me]) => {
        console.debug('[ShoutRatingControl] on reactions update')
        const shoutRatings = Object.values(reactions).filter((r) => !r.reply_to)
        setRatings((_) => shoutRatings.sort(byCreated))
        setMyRate((_) => shoutRatings.find((r) => r.created_by.id === me?.id))
        // Extract likes and dislikes from shoutRatings using map
        const likes = shoutRatings.filter((rating) => rating.kind === 'LIKE').length
        const dislikes = shoutRatings.filter((rating) => rating.kind === 'DISLIKE').length

        // Calculate the total
        const total = likes - dislikes
        setTotal(total)
      },
      { defer: true }
    )
  )

  const handleRatingChange = (voteKind: ReactionKind) => {
    requireAuthentication(async () => {
      setIsLoading(true)

      if (!myRate()) {
        console.debug('[ShoutRatingControl.handleRatingChange] shout wasnt voted by you before', myRate())
        const rateInput = { kind: voteKind, shout: props.shout.id }
        const fakeId = Date.now() + Math.floor(Math.random() * 1000)
        const savedRatings = [...props.ratings]
        mergeProps(props.ratings, [...props.ratings, { ...rateInput, id: fakeId, created_by: author() }])
        await createReaction(rateInput)
        console.debug(`[ShoutRatingControl.handleRatingChange] your ${voteKind} vote was created`)
      } else {
        console.debug('[ShoutRatingControl.handleRatingChange] shout already has your vote', myRate())
        const oppositeKind = voteKind === ReactionKind.Like ? ReactionKind.Dislike : ReactionKind.Like
        if (myRate()?.kind === oppositeKind) {
          mergeProps(
            props.ratings,
            props.ratings.filter((r) => r.id === myRate().id)
          )
          await deleteReaction(myRate().id)
          setMyRate(undefined)
          console.debug(`[ShoutRatingControl.handleRatingChange] your ${oppositeKind} vote was removed`)
        }
        if (myRate()?.kind === voteKind) {
          console.debug(`[ShoutRatingControl.handleRatingChange] cant vote ${voteKind} twice`)
        }
      }

      const ratings = await loadReactionsBy({ by: { shout: props.shout.slug, rating: true } })
      mergeProps(props.ratings, ratings)
      const s = await loadShout(props.shout.slug)
      mergeProps(props.shout, s)
      setIsLoading(false)
    }, 'vote')
  }
  const isNotDisliked = createMemo(() => !myRate() || myRate()?.kind === ReactionKind.Dislike)
  const isNotLiked = createMemo(() => !myRate() || myRate()?.kind === ReactionKind.Like)
  return (
    <div class={clsx(styles.rating, props.class)}>
      <button onClick={() => handleRatingChange(ReactionKind.Dislike)} disabled={isLoading()}>
        <Icon
          name={isNotDisliked() ? 'rating-control-less' : 'rating-control-checked'}
          class={isLoading() ? 'rotating' : ''}
        />
      </button>

      <Popup trigger={<span class={styles.ratingValue}>{total()}</span>} variant="tiny">
        <VotersList
          reactions={ratings()}
          fallbackMessage={isLoading() ? t('Loading') : t('This post has not been rated yet')}
        />
      </Popup>

      <button onClick={() => handleRatingChange(ReactionKind.Like)} disabled={isLoading()}>
        <Icon
          name={isNotLiked() ? 'rating-control-more' : 'rating-control-checked'}
          class={isLoading() ? 'rotating' : ''}
        />
      </button>
    </div>
  )
}
