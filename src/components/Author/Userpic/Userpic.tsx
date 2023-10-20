import { createSignal, Show } from 'solid-js'
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
  hasLink?: boolean
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' // 19 | 28 | 32 | 40 | 168
}

export const Userpic = (props: Props) => {
  const [userpicUrl, setUserpicUrl] = createSignal<string>()
  const letters = () => {
    if (!props.name) return
    const names = props.name ? props.name.split(' ') : []
    return names[0][0] + (names.length > 1 ? names[1][0] : '')
  }

  const comutedAvatarSize = () => {
    switch (props.size) {
      case 'XS': {
        return '32x32'
      }
      case 'S': {
        return '56x56'
      }
      case 'L': {
        return '80x80'
      }
      case 'XL': {
        return '336x336'
      }
      default: {
        return '62x62'
      }
    }
  }

  setUserpicUrl(
    props.userpic && props.userpic.includes('100x')
      ? props.userpic.replace('100x', comutedAvatarSize())
      : props.userpic
  )

  return (
    <div
      class={clsx(styles.Userpic, props.class, styles[props.size ?? 'M'], {
        ['cursorPointer']: props.onClick
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
                src={imageProxy(userpicUrl()) || '/icons/user-default.svg'}
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
