import type { Author } from '../../graphql/schema/core.gen'

import { clsx } from 'clsx'

import styles from './AuthorRatingControl.module.scss'

interface AuthorRatingControlProps {
  author: Author
  class?: string
}

export const AuthorRatingControl = (props: AuthorRatingControlProps) => {
  const isUpvoted = false
  const isDownvoted = false

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleRatingChange = (isUpvote: boolean) => {
    console.log('handleRatingChange', { isUpvote })
  }

  return (
    <div
      class={clsx(styles.rating, props.class, {
        [styles.isUpvoted]: isUpvoted,
        [styles.isDownvoted]: isDownvoted,
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
