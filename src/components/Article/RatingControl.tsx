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
    <div class={clsx(props.class, styles.rating)}>
      <button class={styles.ratingControl} onClick={props.onDownvote}>
        &minus;
      </button>
      <span class={styles.ratingValue}>{props?.rating || ''}</span>
      <button class={styles.ratingControl} onClick={props.onUpvote}>
        +
      </button>
    </div>
  )
}
