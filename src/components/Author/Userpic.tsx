import { Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import style from './Userpic.module.scss'
import { clsx } from 'clsx'

interface UserpicProps {
  user: Author
  hasLink?: boolean
  isBig?: boolean
  class?: string
}

export default (props: UserpicProps) => {
  const letters = () => {
    const names = props.user && props.user.name ? props.user.name.split(' ') : []

    return names[0][0] + (names.length > 1 ? names[1][0] : '')
  }

  return (
    <div class={clsx(style.circlewrap, props.class)} classList={{ [style.big]: props.isBig }}>
      <Show when={props.hasLink}>
        <a href={`/author/${props.user.slug}`}>
          <Show
            when={props.user && props.user.userpic === ''}
            fallback={
              <img
                src={props.user.userpic || '/icons/user-anonymous.svg'}
                alt={props.user.name || ''}
                classList={{ anonymous: !props.user.userpic }}
              />
            }
          >
            <div class={style.userpic}>{letters()}</div>
          </Show>
        </a>
      </Show>

      <Show when={!props.hasLink}>
        <Show
          when={props.user && props.user.userpic === ''}
          fallback={
            <img
              src={props.user.userpic || '/icons/user-anonymous.svg'}
              alt={props.user.name || ''}
              classList={{ anonymous: !props.user.userpic }}
            />
          }
        >
          <div class={style.userpic}>{letters()}</div>
        </Show>
      </Show>
    </div>
  )
}
