import styles from './ShoutRatingControl.module.scss'
import { clsx } from 'clsx'
import { createMemo } from 'solid-js'
import { ReactionKind, Shout } from '../../graphql/types.gen'
import { loadShout } from '../../stores/zine/articles'
import { useSession } from '../../context/session'
import { useReactions } from '../../context/reactions'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'
import { useLocalize } from '../../context/localize'

interface ShoutRatingControlProps {
  shout: Shout
  class?: string
}

export const ShoutRatingControl = (props: ShoutRatingControlProps) => {
  const { t } = useLocalize()
  const {
    user,
    isAuthenticated,
    actions: { callAuthenticationModal }
  } = useSession()

  const {
    reactionEntities,
    actions: { createReaction, deleteReaction, loadReactionsBy }
  } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.createdBy.slug === user()?.slug &&
        r.shout.id === props.shout.id &&
        !r.replyTo
    )

  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))

  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))

  const shoutRatingReactions = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r) =>
        [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) &&
        r.shout.id === props.shout.id &&
        !r.replyTo
    )
  )

  const deleteShoutReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.createdBy.slug === user()?.slug &&
        r.shout.id === props.shout.id &&
        !r.replyTo
    )
    return deleteReaction(reactionToDelete.id)
  }

  const handleRatingChange = async (isUpvote: boolean) => {
    if (!isAuthenticated()) {
      callAuthenticationModal()
    } else {
      if (isUpvoted()) {
        await deleteShoutReaction(ReactionKind.Like)
      } else if (isDownvoted()) {
        await deleteShoutReaction(ReactionKind.Dislike)
      } else {
        await createReaction({
          kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
          shout: props.shout.id
        })
      }

      loadShout(props.shout.slug)
      loadReactionsBy({
        by: { shout: props.shout.slug }
      })
    }
  }

  return (
    <div
      class={clsx(styles.rating, props.class, {
        [styles.isUpvoted]: isUpvoted(),
        [styles.isDownvoted]: isDownvoted()
      })}
    >
      <button
        class={clsx(styles.ratingControl, styles.downvoteButton)}
        onClick={() => handleRatingChange(false)}
      >
        &minus;
      </button>

      <Popup trigger={<span class={styles.ratingValue}>{props.shout.stat.rating}</span>} variant="tiny">
        <VotersList
          reactions={shoutRatingReactions()}
          fallbackMessage={t('This post has not been rated yet')}
        />
      </Popup>

      <button
        class={clsx(styles.ratingControl, styles.upvoteButton)}
        onClick={() => handleRatingChange(true)}
      >
        +
      </button>
    </div>
  )
}
