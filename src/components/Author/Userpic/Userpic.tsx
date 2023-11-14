import { clsx } from 'clsx'
import { createMemo, Show } from 'solid-js'

import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { Image } from '../../_shared/Image'
import { Loading } from '../../_shared/Loading'

import styles from './Userpic.module.scss'

type Props = {
  name: string
  userpic: string
  class?: string
  slug?: string
  onClick?: () => void
  loading?: boolean
  hasLink?: boolean
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' // 20 | 28 | 32 | 40 | 168
}

export const Userpic = (props: Props) => {
  const letters = () => {
    if (!props.name) return
    const names = props.name ? props.name.split(' ') : []
    return names[0][0] + (names.length > 1 ? names[1][0] : '')
  }

  const avatarSize = createMemo(() => {
    switch (props.size) {
      case 'XS': {
        return 40
      }
      case 'S': {
        return 56
      }
      case 'L': {
        return 80
      }
      case 'XL': {
        return 336
      }
      default: {
        return 64
      }
    }
  })

  return (
    <div
      class={clsx(styles.Userpic, props.class, styles[props.size ?? 'M'], {
        ['cursorPointer']: props.onClick,
      })}
      onClick={props.onClick}
    >
      <Show when={!props.loading} fallback={<Loading />}>
        <ConditionalWrapper
          condition={props.hasLink}
          wrapper={(children) => <a href={`/author/${props.slug}`}>{children}</a>}
        >
          <Show keyed={true} when={props.userpic} fallback={<div class={styles.letters}>{letters()}</div>}>
            <Image src={props.userpic} width={avatarSize()} height={avatarSize()} alt={props.name} />
          </Show>
        </ConditionalWrapper>
      </Show>
    </div>
  )
}
