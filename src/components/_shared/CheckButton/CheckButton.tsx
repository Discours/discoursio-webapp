import { clsx } from 'clsx'
import { Show } from 'solid-js'

import { Icon } from '../Icon'

import styles from './CheckButton.module.scss'

type Props = {
  class?: string
  checked: boolean
  text: string
  onClick: () => void
}

// Signed - check mark icon
// On hover - cross icon
// If you clicked on the cross, you unsubscribed. Then the “Subscribe” button appears

export const CheckButton = (props: Props) => {
  return (
    <button type="button" class={clsx(styles.CheckButton, props.class)} onClick={() => props.onClick()}>
      <Show
        when={!props.checked}
        fallback={
          <>
            <Icon name="check-subscribed-black" class={styles.check} />
            <Icon name="close-white" class={styles.close} />
          </>
        }
      >
        {props.text}
      </Show>
    </button>
  )
}
