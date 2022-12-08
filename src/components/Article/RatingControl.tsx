import styles from './RatingControl.module.scss'
import { clsx } from 'clsx'

interface RatingControlProps {
  rating?: number
  class?: string
}

export const RatingControl = (props: RatingControlProps) => {
  return (
    <div class={clsx(props.class, styles.rating)}>
      <button class={styles.ratingControl}>&minus;</button>
      <span class={styles.ratingValue}>{props?.rating || ''}</span>
      <button class={styles.ratingControl}>+</button>
    </div>
  )
}
