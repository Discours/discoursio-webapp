import { clsx } from 'clsx'
import { useConfirm } from '../../../context/confirm'
import styles from './ConfirmModal.module.scss'

export const ConfirmModal = () => {
  const {
    confirmMessage,
    actions: { resolveConfirm }
  } = useConfirm()

  return (
    <div>
      <h4 class={styles.confirmModalTitle}>{confirmMessage().confirmBody}</h4>

      <div class={styles.confirmModalActions}>
        <button class={styles.confirmModalButton} onClick={() => resolveConfirm(false)}>
          {confirmMessage().declineButtonLabel}
        </button>
        <button
          class={clsx(styles.confirmModalButton, styles.confirmModalButtonPrimary)}
          onClick={() => resolveConfirm(true)}
        >
          {confirmMessage().confirmButtonLabel}
        </button>
      </div>
    </div>
  )
}
