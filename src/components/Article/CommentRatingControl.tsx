import { clsx } from 'clsx'
import styles from './CommentRatingControl.module.scss'
import type { Reaction } from '../../graphql/types.gen'
import { ReactionKind } from '../../graphql/types.gen'
import { useSession } from '../../context/session'
import { useReactions } from '../../context/reactions'
import { createMemo } from 'solid-js'
import { loadShout } from '../../stores/zine/articles'
import { Popup } from '../_shared/Popup'
import { useLocalize } from '../../context/localize'
import { useSnackbar } from '../../context/snackbar'
import VotersList from '../_shared/VotersList'

type Props = {
  comment: Reaction
}

export const CommentRatingControl = (props: Props) => {
  const { t } = useLocalize()
  const { userSlug } = useSession()
  const {
    actions: { showSnackbar }
  } = useSnackbar()
  const {
    reactionEntities,
    actions: { createReaction, deleteReaction, loadReactionsBy }
  } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.createdBy.slug === userSlug() &&
        r.shout.id === props.comment.shout.id &&
        r.replyTo === props.comment.id
    )
  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))
  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))
  const canVote = createMemo(() => userSlug() !== props.comment.createdBy.slug)

  const commentRatingReactions = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r) =>
        [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) &&
        r.shout.id === props.comment.shout.id &&
        r.replyTo === props.comment.id
    )
  )

  const deleteCommentReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.createdBy.slug === userSlug() &&
        r.shout.id === props.comment.shout.id &&
        r.replyTo === props.comment.id
    )
    return deleteReaction(reactionToDelete.id)
  }

  const handleRatingChange = async (isUpvote: boolean) => {
    try {
      if (isUpvoted()) {
        await deleteCommentReaction(ReactionKind.Like)
      } else if (isDownvoted()) {
        await deleteCommentReaction(ReactionKind.Dislike)
      } else {
        await createReaction({
          kind: isUpvote ? ReactionKind.Like : ReactionKind.Dislike,
          shout: props.comment.shout.id,
          replyTo: props.comment.id
        })
      }
    } catch {
      showSnackbar({ type: 'error', body: t('Error') })
    }

    await loadShout(props.comment.shout.slug)
    await loadReactionsBy({
      by: { shout: props.comment.shout.slug }
    })
  }

  return (
    <div class={styles.commentRating}>
      <button
        role="button"
        disabled={!canVote() || !userSlug()}
        onClick={() => handleRatingChange(true)}
        class={clsx(styles.commentRatingControl, styles.commentRatingControlUp, {
          [styles.voted]: isUpvoted()
        })}
      />
      <Popup
        trigger={
          <div
            class={clsx(styles.commentRatingValue, {
              [styles.commentRatingPositive]: props.comment.stat.rating > 0,
              [styles.commentRatingNegative]: props.comment.stat.rating < 0
            })}
          >
            {props.comment.stat.rating || 0}
          </div>
        }
        variant="tiny"
      >
        <VotersList
          reactions={commentRatingReactions()}
          fallbackMessage={t('This comment has not yet been rated')}
        />
      </Popup>
      <button
        role="button"
        disabled={!canVote() || !userSlug()}
        onClick={() => handleRatingChange(false)}
        class={clsx(styles.commentRatingControl, styles.commentRatingControlDown, {
          [styles.voted]: isDownvoted()
        })}
      />
    </div>
  )
}
