import { clsx } from 'clsx'
import styles from './SocialNetworkInput.module.scss'
import { Icon } from '../Icon'

type Props = {
  class?: string
  network?: 'twitter' | 'facebook' | 'telegram' | 'vk' | 'instagram' | 'linkedin'
  handleChange: () => void
  slug: string
}

export const SocialNetworkInput = (props: Props) => {
  return (
    <div class={clsx(styles.SocialNetworkInput, props.class)}>
      <div class={styles.icon}>
        <Icon name={props.network ? `social-${props.network}` : 'user-link-default'} />
      </div>
      <input
        class={styles.input}
        type="text"
        onChange={() => props.handleChange}
        placeholder={`https://${props.network}.com/${props.slug}`}
      />
    </div>
  )
}
