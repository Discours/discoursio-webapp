import { clsx } from 'clsx'
import { Show, createMemo, createSignal } from 'solid-js'

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
    author,
    actions: { requireAuthentication },
  } = useSession()

  const {
    reactionEntities,
    actions: { createReaction, deleteReaction, loadReactionsBy },
  } = useReactions()

  const [isLoading, setIsLoading] = createSignal(false)

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.id === author()?.id &&
        r.shout.id === props.shout.id &&
        !r.reply_to,
    )

  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))
  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))

  const shoutRatingReactions = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r) => ['LIKE', 'DISLIKE'].includes(r.kind) && r.shout.id === props.shout.id && !r.reply_to,
    ),
  )

  const deleteShoutReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.id === author()?.id &&
        r.shout.id === props.shout.id &&
        !r.reply_to,
    )
    return deleteReaction(reactionToDelete.id)
  }

  const handleRatingChange = async (isUpvote: boolean) => {
    requireAuthentication(async () => {
      setIsLoading(true)
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

      setIsLoading(false)
    }, 'vote')
  }

  return (
    <div class={clsx(styles.rating, props.class)}>
      <button onClick={() => handleRatingChange(false)} disabled={isLoading()}>
        <Show when={!isDownvoted()} fallback={<Icon name="rating-control-checked" />}>
          <Icon name="rating-control-less" />
        </Show>
      </button>

      <Popup trigger={<span class={styles.ratingValue}>{props.shout.stat.rating}</span>} variant="tiny">
        <VotersList
          reactions={shoutRatingReactions()}
          fallbackMessage={t('This post has not been rated yet')}
        />
      </Popup>

      <button onClick={() => handleRatingChange(true)} disabled={isLoading()}>
        <Show when={!isUpvoted()} fallback={<Icon name="rating-control-checked" />}>
          <Icon name="rating-control-more" />
        </Show>
      </button>
    </div>
  )
}
