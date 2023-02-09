import { Show } from 'solid-js'
import { useSnackbar } from '../../context/snackbar'
import styles from './Snackbar.module.scss'
import { Transition } from 'solid-transition-group'
import { clsx } from 'clsx'

export const Snackbar = () => {
  const { snackbarMessage } = useSnackbar()

  return (
    <div
      class={clsx(styles.snackbar, {
        [styles.error]: snackbarMessage()?.type === 'error'
      })}
    >
      <Transition
        enterClass={styles.enter}
        exitToClass={styles.exitTo}
        onExit={(el, done) => setTimeout(() => done(), 300)}
      >
        <Show when={snackbarMessage()}>
          <div class={styles.content}>{snackbarMessage().body}</div>
        </Show>
      </Transition>
    </div>
  )
}
