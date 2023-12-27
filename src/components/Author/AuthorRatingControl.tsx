import type { Author } from '../../graphql/schema/core.gen'

import { clsx } from 'clsx'

import styles from './AuthorRatingControl.module.scss'
import { Show, createSignal } from 'solid-js'
import { useLocalize } from '../../context/localize'
import { apiClient } from '../../graphql/client/core'

interface AuthorRatingControlProps {
  author: Author
  class?: string
}

export const AuthorRatingControl = (props: AuthorRatingControlProps) => {
  const isUpvoted = false
  const isDownvoted = false
  const { t } = useLocalize()
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleRatingChange = async (isUpvote: boolean) => {
    console.log('handleRatingChange', { isUpvote })
    await apiClient.rateAuthor({ rated_slug: props.author.slug, value: isUpvote ? 1 : -1 })
  }

  const [rating, setRating] = createSignal(props.author.stat.rating)
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
      <div>
        <div class={styles.ratingValue}>{rating()}</div>
        <Show when={props.author?.stat?.rating_shouts}>
          <div class={styles.ratingValue}>{props.author?.stat?.rating_shouts}</div>
        </Show>
        <Show when={props.author?.stat?.rating_comments}>
          <div class={styles.ratingValue}>{props.author?.stat?.rating_comments}</div>
        </Show>
      </div>
      <button
        class={clsx(styles.ratingControl, styles.upvoteButton)}
        onClick={() => handleRatingChange(true)}
      >
        +
      </button>
    </div>
  )
}
