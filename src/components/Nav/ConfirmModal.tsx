import { clsx } from 'clsx'

import { useConfirm } from '../../context/confirm'

import styles from './Confirm.module.scss'

export const ConfirmModal = () => {
  const {
    confirmMessage,
    actions: { showConfirm }
  } = useConfirm()

  return (
    <div>
      <h4 class={styles.confirmModalTitle}>{confirmMessage().confirmBody}</h4>

      <div class={styles.confirmModalActions}>
        <button class={styles.confirmModalButton} onClick={() => showConfirm.reject()}>
          {confirmMessage().declineButtonLabel}
        </button>
        <button
          class={clsx(styles.confirmModalButton, styles.confirmModalButtonPrimary)}
          onClick={() => showConfirm.resolve()}
        >
          {confirmMessage().confirmButtonLabel}
        </button>
      </div>
    </div>
  )
}
