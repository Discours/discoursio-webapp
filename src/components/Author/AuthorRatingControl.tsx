import styles from './AuthorRatingControl.module.scss'
import { clsx } from 'clsx'
import type { Author } from '../../graphql/types.gen'

interface AuthorRatingControlProps {
  author: Author
  class?: string
}

export const AuthorRatingControl = (props: AuthorRatingControlProps) => {
  const isUpvoted = false
  const isDownvoted = false

  const handleRatingChange = (isUpvote: boolean) => {
    console.log('handleRatingChange', { isUpvote })
  }

  return (
    <div
      class={clsx(styles.rating, props.class, {
        [styles.isUpvoted]: isUpvoted,
        [styles.isDownvoted]: isDownvoted
      })}
    >
      <button
        class={clsx(styles.ratingControl, styles.downvoteButton)}
        onClick={() => handleRatingChange(false)}
      >
        &minus;
      </button>
      {/*TODO*/}
      <span class={styles.ratingValue}>{123}</span>
      <button
        class={clsx(styles.ratingControl, styles.upvoteButton)}
        onClick={() => handleRatingChange(true)}
      >
        +
      </button>
    </div>
  )
}
