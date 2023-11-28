import { clsx } from 'clsx'
import { createMemo, Show } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { ReactionKind, Shout } from '../../graphql/schema/core.gen'
import { loadShout } from '../../stores/zine/articles'
import { Icon } from '../_shared/Icon'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'

import styles from './ShoutRatingControl.module.scss'

interface ShoutRatingControlProps {
  shout: Shout
  class?: string
}

export const ShoutRatingControl = (props: ShoutRatingControlProps) => {
  const { t } = useLocalize()
  const {
    user,
    actions: { requireAuthentication },
  } = useSession()

  const {
    reactionEntities,
    actions: { createReaction, deleteReaction, loadReactionsBy },
  } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === user()?.slug &&
        r.shout.id === props.shout.id &&
        !r.reply_to,
    )

  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))

  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))

  const shoutRatingReactions = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r) =>
        [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) &&
        r.shout.id === props.shout.id &&
        !r.reply_to,
    ),
  )

  const deleteShoutReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === user()?.slug &&
        r.shout.id === props.shout.id &&
        !r.reply_to,
    )
    return deleteReaction(reactionToDelete.id)
  }

  const handleRatingChange = async (isUpvote: boolean) => {
    requireAuthentication(async () => {
      if (isUpvoted()) {
        await deleteShoutReaction(ReactionKind.Like)
      } else if (isDownvoted()) {
        await deleteShoutReaction(ReactionKind.Dislike)
      } else {
        await createReaction({
          kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
          shout: props.shout.id,
        })
      }

      loadShout(props.shout.slug)
      loadReactionsBy({
        by: { shout: props.shout.slug },
      })
    }, 'vote')
  }

  return (
    <div class={clsx(styles.rating, props.class)}>
      <button onClick={() => handleRatingChange(false)}>
        <Show when={!isDownvoted()}>
          <Icon name="rating-control-less" />
        </Show>
        <Show when={isDownvoted()}>
          <Icon name="rating-control-checked" />
        </Show>
      </button>

      <Popup trigger={<span class={styles.ratingValue}>{props.shout.stat.rating}</span>} variant="tiny">
        <VotersList
          reactions={shoutRatingReactions()}
          fallbackMessage={t('This post has not been rated yet')}
        />
      </Popup>

      <button onClick={() => handleRatingChange(true)}>
        <Show when={!isUpvoted()}>
          <Icon name="rating-control-more" />
        </Show>
        <Show when={isUpvoted()}>
          <Icon name="rating-control-checked" />
        </Show>
      </button>
    </div>
  )
}
