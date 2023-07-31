import { clsx } from 'clsx'
import { useConfirm } from '../../../context/confirm'
import styles from './ConfirmModal.module.scss'
import { useLocalize } from '../../../context/localize'

export const ConfirmModal = () => {
  const { t } = useLocalize()

  const {
    confirmMessage,
    actions: { resolveConfirm }
  } = useConfirm()

  return (
    <div>
      <h4 class={styles.confirmModalTitle}>
        {confirmMessage().confirmBody ?? t('Are you sure you want to to proceed the action?')}
      </h4>

      <div class={styles.confirmModalActions}>
        <button class={styles.confirmModalButton} onClick={() => resolveConfirm(false)}>
          {confirmMessage().declineButtonLabel ?? t('Decline')}
        </button>
        <button
          class={clsx(styles.confirmModalButton, styles.confirmModalButtonPrimary)}
          onClick={() => resolveConfirm(true)}
        >
          {confirmMessage().confirmButtonLabel ?? t('Confirm')}
        </button>
      </div>
    </div>
  )
}
