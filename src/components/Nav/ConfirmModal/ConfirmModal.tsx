import { useLocalize } from '../../../context/localize'
import { useUI } from '../../../context/ui'
import { Button } from '../../_shared/Button'

import styles from './ConfirmModal.module.scss'

export const ConfirmModal = () => {
  const { t } = useLocalize()
  const { confirmMessage, resolveConfirm } = useUI()

  return (
    <div class={styles.confirmModal}>
      <h4 class={styles.confirmModalTitle}>
        {confirmMessage().confirmBody ?? t('Are you sure you want to to proceed the action?')}
      </h4>

      <div class={styles.confirmModalActions}>
        <Button
          onClick={() => resolveConfirm(false)}
          value={confirmMessage().declineButtonLabel ?? t('Decline')}
          size="L"
          variant={confirmMessage().declineButtonVariant ?? 'secondary'}
          class={styles.confirmAction}
        />
        <Button
          onClick={() => resolveConfirm(true)}
          value={confirmMessage().confirmButtonLabel ?? t('Confirm')}
          size="L"
          variant={confirmMessage().confirmButtonVariant ?? 'primary'}
          class={styles.confirmAction}
        />
      </div>
    </div>
  )
}
