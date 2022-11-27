import styles from './RatingControl.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../_shared/Icon'

interface RatingControlProps {
  rating?: number
  class?: string
}

export const RatingControl = (props: RatingControlProps) => {
  return (
    <div class={clsx(props.class, styles.rating)}>
      <button class={styles.ratingControl}>
        <Icon name="dislike" />
      </button>
      <span class={styles.ratingValue}>{props?.rating || ''}</span>
      <button class={styles.ratingControl}>
        <Icon name="like" />
      </button>
    </div>
  )
}

export default RatingControl
