import { clsx } from 'clsx'
import { createMemo } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { useSnackbar } from '../../context/snackbar'
import { Reaction, ReactionKind } from '../../graphql/schema/core.gen'
import { loadShout } from '../../stores/zine/articles'
import { Popup } from '../_shared/Popup'
import { VotersList } from '../_shared/VotersList'

import styles from './CommentRatingControl.module.scss'

type Props = {
  comment: Reaction
}

export const CommentRatingControl = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()
  const {
    actions: { showSnackbar },
  } = useSnackbar()
  const {
    reactionEntities,
    actions: { createReaction, deleteReaction, loadReactionsBy },
  } = useReactions()

  const checkReaction = (reactionKind: ReactionKind) =>
    Object.values(reactionEntities).some(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === user()?.slug &&
        r.shout.id === props.comment.shout.id &&
        r.reply_to === props.comment.id,
    )
  const isUpvoted = createMemo(() => checkReaction(ReactionKind.Like))
  const isDownvoted = createMemo(() => checkReaction(ReactionKind.Dislike))
  const canVote = createMemo(() => user()?.slug !== props.comment.created_by.slug)

  const commentRatingReactions = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r) =>
        [ReactionKind.Like, ReactionKind.Dislike].includes(r.kind) &&
        r.shout.id === props.comment.shout.id &&
        r.reply_to === props.comment.id,
    ),
  )

  const deleteCommentReaction = async (reactionKind: ReactionKind) => {
    const reactionToDelete = Object.values(reactionEntities).find(
      (r) =>
        r.kind === reactionKind &&
        r.created_by.slug === user()?.slug &&
        r.shout.id === props.comment.shout.id &&
        r.reply_to === props.comment.id,
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
          reply_to: props.comment.id,
        })
      }
    } catch {
      showSnackbar({ type: 'error', body: t('Error') })
    }

    await loadShout(props.comment.shout.slug)
    await loadReactionsBy({
      by: { shout: props.comment.shout.slug },
    })
  }

  return (
    <div class={styles.commentRating}>
      <button
        role="button"
        disabled={!canVote() || !user()}
        onClick={() => handleRatingChange(true)}
        class={clsx(styles.commentRatingControl, styles.commentRatingControlUp, {
          [styles.voted]: isUpvoted(),
        })}
      />
      <Popup
        trigger={
          <div
            class={clsx(styles.commentRatingValue, {
              [styles.commentRatingPositive]: props.comment.stat.rating > 0,
              [styles.commentRatingNegative]: props.comment.stat.rating < 0,
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
        disabled={!canVote() || !user()}
        onClick={() => handleRatingChange(false)}
        class={clsx(styles.commentRatingControl, styles.commentRatingControlDown, {
          [styles.voted]: isDownvoted(),
        })}
      />
    </div>
  )
}
