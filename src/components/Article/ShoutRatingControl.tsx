import { clsx } from 'clsx'
import { Show, createMemo, createSignal } from 'solid-js'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { useReactions } from '~/context/reactions'
import { useSession } from '~/context/session'
import type { Author } from '~/graphql/schema/core.gen'
import { ReactionKind, Shout } from '~/graphql/schema/core.gen'
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
  const { loadShout } = useFeed()
  const { requireAuthentication, session } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const { reactionEntities, createShoutReaction, deleteShoutReaction, loadReactionsBy } = useReactions()
  const [isLoading, setIsLoading] = createSignal(false)

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities()).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.id === author()?.id &&
        r.shout.id === props.shout.id &&
        !r.reply_to
    )

  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))
  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))

  const shoutRatingReactions = createMemo(() =>
    Object.values(reactionEntities()).filter(
      (r) => ['LIKE', 'DISLIKE'].includes(r.kind) && r.shout.id === props.shout.id && !r.reply_to
    )
  )

  const removeReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.id === author()?.id &&
        r.shout.id === props.shout.id &&
        !r.reply_to
    )
    if (reactionToDelete) return deleteShoutReaction(reactionToDelete.id)
  }

  const handleRatingChange = (isUpvote: boolean) => {
    requireAuthentication(async () => {
      setIsLoading(true)
      if (isUpvoted()) {
        await removeReaction(ReactionKind.Like)
      } else if (isDownvoted()) {
        await removeReaction(ReactionKind.Dislike)
      } else {
        await createShoutReaction({
          reaction: {
            kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
            shout: props.shout.id
          }
        })
      }

      loadShout(props.shout.slug)
      loadReactionsBy({
        by: { shout: props.shout.slug }
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

      <Popup
        trigger={<span class={styles.ratingValue}>{props.shout.stat?.rating || 0}</span>}
        variant="tiny"
      >
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
