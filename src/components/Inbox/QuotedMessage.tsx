import { Show } from 'solid-js'
import styles from './QuotedMessage.module.scss'
import { Icon } from '../_shared/Icon'
import { clsx } from 'clsx'

type QuotedMessage = {
  body: string
  cancel?: () => void
  author?: string
  variant: 'inline' | 'reply'
}

const QuotedMessage = (props: QuotedMessage) => {
  return (
    <div class={styles.QuotedMessage}>
      <div class={styles.icon}>
        <Icon name="chat-reply" />
      </div>
      <div class={styles.body}>
        <Show when={props.author}>
          <div class={styles.author}>{props.author}</div>
        </Show>
        <div class={styles.quote}>{props.body}</div>
      </div>
      <Show when={props.cancel && props.variant !== 'inline'}>
        <div class={clsx(styles.cancel, styles.icon)} onClick={props.cancel}>
          <Icon name="close-gray" />
        </div>
      </Show>
    </div>
  )
}

export default QuotedMessage
