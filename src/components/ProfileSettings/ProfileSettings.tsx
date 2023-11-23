import { clsx } from 'clsx'
import styles from './ProfileSettings.module.scss'

type Props = {
  class?: string
}

export const ProfileSettings = (props: Props) => {
  return <div class={clsx(styles.ProfileSettings, props.class)}>ProfileSettings</div>
}
