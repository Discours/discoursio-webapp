import { clsx } from 'clsx'
import { Show, createEffect } from 'solid-js'

import { useSnackbar } from '~/context/ui'
import { Icon } from '../_shared/Icon'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

import styles from './Snackbar.module.scss'

export const Snackbar = () => {
  const { snackbarMessage } = useSnackbar()
  let snackbarRef: HTMLDivElement | undefined

  createEffect(() => {
    if (snackbarMessage()?.body) {
      snackbarRef?.classList.add(styles.show)
    } else {
      snackbarRef?.classList.remove(styles.show)
    }
  })

  return (
    <div
      ref={snackbarRef}
      class={clsx(styles.snackbar, {
        [styles.error]: snackbarMessage()?.type === 'error',
        [styles.success]: snackbarMessage()?.type === 'success'
      })}
    >
      <ShowOnlyOnClient>
        <Show when={snackbarMessage()?.body}>
          <div class={styles.content}>
            <Show when={snackbarMessage()?.type === 'success'}>
              <Icon name="check-success" class={styles.icon} />
            </Show>
            {snackbarMessage()?.body || ''}
          </div>
        </Show>
      </ShowOnlyOnClient>
    </div>
  )
}
