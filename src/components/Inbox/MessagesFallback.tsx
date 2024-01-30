import { Show } from 'solid-js'

import styles from './MessagesFallback.module.scss'

type MessagesFallback = {
  message: string
  onClick?: () => void
  actionText?: string
}

const MessagesFallback = (props: MessagesFallback) => {
  return (
    <div class={styles.MessagesFallback}>
      <div>
        <p class={styles.text}>{props.message}</p>
        <Show when={() => props.onClick()}>
          <button class={styles.button} type="button" onClick={() => props.onClick()}>
            {props.actionText}
          </button>
        </Show>
      </div>
    </div>
  )
}

export default MessagesFallback
