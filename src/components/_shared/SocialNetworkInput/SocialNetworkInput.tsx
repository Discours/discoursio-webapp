import { clsx } from 'clsx'
import styles from './SocialNetworkInput.module.scss'
import { Icon } from '../Icon'

type Props = {
  class?: string
  network?: string
  link?: string
  isExist: boolean
  handleChange: (value: string) => void
  slug?: string
  autofocus?: boolean
}

export const SocialNetworkInput = (props: Props) => {
  return (
    <div class={clsx(styles.SocialNetworkInput, props.class)}>
      <div class={styles.icon}>
        <Icon name={props.network ? `social-${props.network}` : 'user-link-default'} />
      </div>
      <input
        autofocus={props.autofocus}
        class={styles.input}
        type="text"
        value={props.isExist ? props.link : null}
        onChange={(event) => props.handleChange(event.currentTarget.value)}
        placeholder={props.autofocus ? null : `${props.link}/${props.slug}`}
      />
    </div>
  )
}
