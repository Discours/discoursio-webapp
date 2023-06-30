import { Show } from 'solid-js'
import type { Author, User } from '../../graphql/types.gen'
import styles from './Userpic.module.scss'
import { clsx } from 'clsx'

interface UserpicProps {
  user: Author | User
  hasLink?: boolean
  isBig?: boolean
  class?: string
  isAuthorsList?: boolean
  isFeedMode?: boolean
}

export default (props: UserpicProps) => {
  const letters = () => {
    const names = props.user && props.user.name ? props.user.name.split(' ') : []

    return names[0][0] + (names.length > 1 ? names[1][0] : '')
  }

  return (
    <div
      class={clsx(styles.circlewrap, props.class)}
      classList={{
        [styles.big]: props.isBig,
        [styles.authorsList]: props.isAuthorsList,
        [styles.feedMode]: props.isFeedMode
      }}
    >
      <Show when={props.hasLink}>
        <a href={`/author/${props.user.slug}`}>
          <Show
            when={props.user && props.user.userpic === ''}
            fallback={
              <img
                src={props.user.userpic || '/icons/user-default.svg'}
                alt={props.user.name || ''}
                classList={{ [styles.anonymous]: !props.user.userpic }}
              />
            }
          >
            <div class={styles.userpic}>{letters()}</div>
          </Show>
        </a>
      </Show>

      <Show when={!props.hasLink}>
        <Show
          when={props.user && props.user.userpic === ''}
          fallback={
            <img
              src={props.user.userpic || '/icons/user-default.svg'}
              alt={props.user.name || ''}
              classList={{ [styles.anonymous]: !props.user.userpic }}
              loading="lazy"
            />
          }
        >
          <div class={styles.userpic}>{letters()}</div>
        </Show>
      </Show>
    </div>
  )
}
