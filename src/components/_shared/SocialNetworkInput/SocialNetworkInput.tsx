import { clsx } from 'clsx'
import styles from './SocialNetworkInput.module.scss'
import { Icon } from '../Icon'

type Props = {
  class?: string
  network: 'twitter' | 'fb' | 'telegram' | 'vk' | 'instagram' | 'ln'
  handleChange: () => void
}

export const SocialNetworkInput = (props: Props) => {
  return (
    <div class={clsx(styles.SocialNetworkInput, props.class)}>
      <div class={styles.icon}>
        <Icon name={props.network} />
      </div>
      <input type="text" onChange={() => props.handleChange} />
    </div>
  )
}
