import { clsx } from 'clsx'
import styles from './GroupAvatar.module.scss'
import { For } from 'solid-js'
import { Userpic } from '../../Author/Userpic'
import { NotificationUser } from '../../NotificationsPanel/NotificationView/NotificationView'

type Props = {
  class?: string
  authors: NotificationUser[]
}

export const GroupAvatar = (props: Props) => {
  const displayedAvatars = props.authors.length > 4 ? props.authors.slice(0, 3) : props.authors.slice(0, 4)
  const avatarSize = () => {
    switch (props.authors.length) {
      case 1: {
        return 'M'
      }
      case 2: {
        return 'S'
      }
      default: {
        return 'XS'
      }
    }
  }
  return (
    <div
      class={clsx(styles.GroupAvatar, props.class, {
        [styles.two]: props.authors.length === 2,
        [styles.three]: props.authors.length === 3,
        [styles.four]: props.authors.length >= 4,
      })}
    >
      <For each={displayedAvatars}>
        {(user) => (
          <Userpic size={avatarSize()} name={user.name} userpic={user.userpic} class={styles.item} />
        )}
      </For>
      {props.authors.length > 4 && <div class={styles.moreUsers}>+{props.authors?.length - 3}</div>}
    </div>
  )
}
