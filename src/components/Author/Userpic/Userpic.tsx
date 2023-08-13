import { Show } from 'solid-js'
import styles from './Userpic.module.scss'
import { clsx } from 'clsx'
import { imageProxy } from '../../../utils/imageProxy'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { Loading } from '../../_shared/Loading'

type Props = {
  name: string
  userpic: string
  class?: string
  slug?: string
  onClick?: () => void
  loading?: boolean
  isBig?: boolean
  hasLink?: boolean

  isAuthorsList?: boolean
  isFeedMode?: boolean
}

export const Userpic = (props: Props) => {
  const letters = () => {
    if (!props.name) return
    const names = props.name ? props.name.split(' ') : []
    return names[0][0] + (names.length > 1 ? names[1][0] : '')
  }

  return (
    <div
      class={clsx(styles.Userpic, props.class, {
        [styles.big]: props.isBig,
        [styles.authorsList]: props.isAuthorsList,
        [styles.feedMode]: props.isFeedMode,
        [styles.cursorPointer]: props.onClick
      })}
      onClick={props.onClick}
    >
      <Show when={!props.loading} fallback={<Loading />}>
        <ConditionalWrapper
          condition={props.hasLink}
          wrapper={(children) => <a href={`/author/${props.slug}`}>{children}</a>}
        >
          <Show
            when={!props.userpic}
            fallback={
              <img
                class={clsx({ [styles.anonymous]: !props.userpic })}
                src={imageProxy(props.userpic) || '/icons/user-default.svg'}
                alt={props.name || ''}
                loading="lazy"
              />
            }
          >
            <div class={styles.letters}>{letters()}</div>
          </Show>
        </ConditionalWrapper>
      </Show>
    </div>
  )
}
