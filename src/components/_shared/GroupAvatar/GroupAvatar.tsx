import { clsx } from 'clsx'
import styles from './GroupAvatar.module.scss'
import { Author, Topic } from '../../../graphql/types.gen'
import { For } from 'solid-js'
import { Userpic } from '../../Author/Userpic'

type Props = {
  class?: string
  authors: any
}

export const GroupAvatar = (props: Props) => {
  const displayedAvatars = props.authors.length > 4 ? props.authors.slice(0, 3) : props.authors.slice(0, 4)

  console.log('!!! displayedAvatars.length:', displayedAvatars.length)
  const avatarSize = () => {
    switch (props.authors.length) {
      case 1: {
        return 'L'
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
        [styles.four]: props.authors.length >= 4
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
