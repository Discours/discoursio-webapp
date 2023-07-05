import styles from './Loading.module.scss'
import { clsx } from 'clsx'

type Props = {
  size?: 'small'
}
export const Loading = (props: Props) => {
  return (
    <div
      class={clsx(styles.container, {
        [styles.small]: props.size === 'small'
      })}
    >
      <div class={styles.icon} />
    </div>
  )
}
