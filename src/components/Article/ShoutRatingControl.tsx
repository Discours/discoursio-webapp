import styles from './ShoutRatingControl.module.scss'
import { clsx } from 'clsx'
import { createMemo, For, Match, Switch } from 'solid-js'
import { Author, ReactionKind, Shout } from '../../graphql/types.gen'
import { loadShout } from '../../stores/zine/articles'
import { useSession } from '../../context/session'
import { useReactions } from '../../context/reactions'
import { Button } from '../_shared/Button'
import Userpic from '../Author/Userpic'
import { AuthorCard } from '../Author/Card'
import { Popup } from '../_shared/Popup'

interface ShoutRatingControlProps {
  shout: Shout
  class?: string
}

export const ShoutRatingControl = (props: ShoutRatingControlProps) => {
  const { userSlug } = useSession()

  const {
    reactionEntities,
    actions: { createReaction, deleteReaction, loadReactionsBy }
  } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.createdBy.slug === userSlug() &&
        r.shout.id === props.shout.id &&
        !r.replyTo
    )

  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))

  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))

  const shoutRatingReactions = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r) => [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) && r.shout.id === props.shout.id
    )
  )

  const deleteShoutReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.createdBy.slug === userSlug() &&
        r.shout.id === props.shout.id &&
        !r.replyTo
    )
    return deleteReaction(reactionToDelete.id)
  }

  const handleRatingChange = async (isUpvote: boolean) => {
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
        <ul class={clsx('nodash')}>
          <For each={shoutRatingReactions()}>
            {(reaction) => (
              <li>
                {reaction.kind === ReactionKind.Like ? <>+1</> : <>&minus;1</>} {reaction.createdBy.name}
              </li>
            )}
          </For>
        </ul>
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
