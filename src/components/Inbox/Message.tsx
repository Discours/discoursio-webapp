import { createMemo, Show } from 'solid-js'
import MarkdownIt from 'markdown-it'
import { clsx } from 'clsx'
import styles from './Message.module.scss'
import DialogAvatar from './DialogAvatar'
import { locale } from '../../stores/ui'
import type { Message, ChatMember } from '../../graphql/types.gen'

type Props = {
  content: Message
  ownId: number
  members: ChatMember[]
}

const md = new MarkdownIt({
  linkify: true
})

const Message = (props: Props) => {
  const formattedTime = createMemo<string>(() => {
    return new Date(props.content.createdAt * 1000).toLocaleTimeString(locale(), {
      hour: 'numeric',
      minute: 'numeric'
    })
  })

  console.log('!!! props.ownId:', props.ownId)
  // возвращать ID автора
  const isOwn = props.ownId === Number(props.content.author)

  return (
    <div class={clsx(styles.Message, isOwn && styles.own)}>
      <Show when={!isOwn}>
        <div class={styles.author}>
          <DialogAvatar size="small" name={'Message Author'} />
          <div class={styles.name}>Message Author</div>
        </div>
      </Show>
      <div class={styles.body}>
        <div innerHTML={md.render(props.content.body)} />
      </div>
      <div class={styles.time}>{formattedTime()}</div>
    </div>
  )
}

export default Message
