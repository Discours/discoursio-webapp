import { Show } from 'solid-js'
import { useSnackbar } from '../../context/snackbar'
import styles from './Snackbar.module.scss'
import { Transition } from 'solid-transition-group'
import { clsx } from 'clsx'
import { Icon } from '../_shared/Icon'

export const Snackbar = () => {
  const { snackbarMessage } = useSnackbar()

  return (
    <div
      class={clsx(styles.snackbar, {
        [styles.error]: snackbarMessage()?.type === 'error',
        [styles.success]: snackbarMessage()?.type === 'success'
      })}
    >
      <Transition
        enterClass={styles.enter}
        exitToClass={styles.exitTo}
        onExit={(el, done) => setTimeout(() => done(), 300)}
      >
        <Show when={snackbarMessage()}>
          <div class={styles.content}>
            <Show when={snackbarMessage()?.type === 'success'}>
              <Icon name="check-success" class={styles.icon} />
            </Show>
            {snackbarMessage().body}
          </div>
        </Show>
      </Transition>
    </div>
  )
}
