import styles from './RatingControl.module.scss'
import { clsx } from 'clsx'

interface RatingControlProps {
  rating?: number
  class?: string
  onUpvote: () => Promise<void> | void
  onDownvote: () => Promise<void> | void
  isUpvoted: boolean
  isDownvoted: boolean
}

export const RatingControl = (props: RatingControlProps) => {
  return (
    <div
      class={clsx(styles.rating, props.class, {
        [styles.isUpvoted]: props.isUpvoted,
        [styles.isDownvoted]: props.isDownvoted
      })}
    >
      <button class={clsx(styles.ratingControl, styles.downvoteButton)} onClick={props.onDownvote}>
        &minus;
      </button>
      <span class={styles.ratingValue}>{props?.rating || ''}</span>
      <button class={clsx(styles.ratingControl, styles.upvoteButton)} onClick={props.onUpvote}>
        +
      </button>
    </div>
  )
}
