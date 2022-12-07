import { Show } from 'solid-js'
import MarkdownIt from 'markdown-it'
import { clsx } from 'clsx'
import styles from './Message.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Message, ChatMember } from '../../graphql/types.gen'
import formattedTime from '../../utils/formatDateTime'

type Props = {
  content: Message
  ownId: number
  members: ChatMember[]
}

const md = new MarkdownIt({
  linkify: true
})

const Message = (props: Props) => {
  // возвращать ID автора
  const isOwn = props.ownId === Number(props.content.author)
  const user = props.members?.find((m) => m.id === Number(props.content.author))
  return (
    <div class={clsx(styles.Message, isOwn && styles.own)}>
      <Show when={!isOwn}>
        <div class={styles.author}>
          <DialogAvatar size="small" name={user.name} url={user.userpic} />
          <div class={styles.name}>{user.name}</div>
        </div>
      </Show>
      <div class={styles.body}>
        <div innerHTML={md.render(props.content.body)} />
      </div>
      <div class={styles.time}>{formattedTime(props.content.createdAt)}</div>
    </div>
  )
}

export default Message
