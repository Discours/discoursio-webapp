import { clsx } from 'clsx'
import { Show } from 'solid-js'

import { Icon } from '../_shared/Icon'

import styles from './QuotedMessage.module.scss'

type QuotedMessage = {
  body: string
  cancel?: () => void
  author?: string
  variant: 'inline' | 'reply'
  isOwn?: boolean
}

const QuotedMessage = (props: QuotedMessage) => {
  return (
    <div
      class={clsx(styles.QuotedMessage, {
        [styles.reply]: props.variant === 'reply',
        [styles.inline]: props.variant === 'inline',
        [styles.own]: props.isOwn
      })}
    >
      <Show when={props.variant === 'reply'}>
        <div class={styles.icon}>
          <Icon name="chat-reply" />
        </div>
      </Show>
      <div class={styles.body}>
        <Show when={props.author}>
          <div class={styles.author}>{props.author}</div>
        </Show>
        <div class={styles.quote}>{props.body}</div>
      </div>
      <Show when={props.cancel && props.variant === 'reply'}>
        <div class={clsx(styles.cancel, styles.icon)} onClick={props.cancel}>
          <Icon name="close-gray" />
        </div>
      </Show>
    </div>
  )
}

export default QuotedMessage
