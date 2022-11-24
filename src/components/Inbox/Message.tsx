import { Show } from 'solid-js'
import MarkdownIt from 'markdown-it'
import { clsx } from 'clsx'
import styles from './Message.module.scss'
import DialogAvatar from './DialogAvatar'

type Props = {
  body: string
  isOwn: boolean
}

const md = new MarkdownIt({
  linkify: true
})

const Message = (props: Props) => {
  return (
    <div class={clsx(styles.Message, props.isOwn && styles.own)}>
      <Show when={!props.isOwn}>
        <div class={styles.author}>
          <DialogAvatar size="small" name={'Message Author'} />
          <div class={styles.name}>Message Author</div>
        </div>
      </Show>
      <div class={styles.body}>
        <div innerHTML={md.render(props.body)} />
      </div>
      <div class={styles.time}>12:24</div>
    </div>
  )
}

export default Message
