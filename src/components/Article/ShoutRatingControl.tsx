import { clsx } from 'clsx'
import { createMemo, createSignal, Show } from 'solid-js'

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
    actions: { createReaction, loadReactionsBy },
  } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === author()?.slug &&
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
  const [isLoading, setIsLoading] = createSignal(false)
  const handleRatingChange = async (isUpvote: boolean) => {
    setIsLoading(true)
    requireAuthentication(async () => {
      try {
        await createReaction({
          kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
          shout: props.shout.id,
        })
      } catch (error) {
        console.warn(error)
      }
      setIsLoading(false)
      loadShout(props.shout.slug)
      loadReactionsBy({
        by: { shout: props.shout.slug },
      })
    }, 'vote')
  }

  return (
    <div class={clsx(styles.rating, props.class)}>
      <button onClick={() => handleRatingChange(false)} disabled={isLoading()}>
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

      <button onClick={() => handleRatingChange(true)} disabled={isLoading()}>
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
