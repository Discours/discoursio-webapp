import { For } from 'solid-js'
import './DialogCard.module.scss'
import styles from './GroupDialogAvatar.module.scss'
import { clsx } from 'clsx'
import type { ChatMember } from '../../graphql/types.gen'
import DialogAvatar from './DialogAvatar'

type Props = {
  users: ChatMember[]
}

const GroupDialogAvatar = (props: Props) => {
  const slicedUsers = () => {
    if (props.users.length > 3) {
      return props.users.slice(0, 2)
    }
    return props.users.slice(0, 3)
  }
  return (
    <div class={styles.GroupDialogAvatar}>
      <For each={slicedUsers()}>
        {(user) => (
          <DialogAvatar
            class={styles.grouped}
            bordered={true}
            size="small"
            name={user.name}
            url={user.userpic}
          />
        )}
      </For>
      {props.users.length > 3 && (
        <div class={clsx(styles.counter, { [styles.hundred]: props.users.length >= 100 })}>
          {++props.users.length}
        </div>
      )}
    </div>
  )
}

export default GroupDialogAvatar
