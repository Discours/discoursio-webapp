import { clsx } from 'clsx'
import { useLocalize } from '../../../context/localize'
import { hideModal } from '../../../stores/ui'

import styles from './AuthModal.module.scss'

export const SendEmailConfirm = () => {
  const { t } = useLocalize()
  return (
    <div
      style={{
        'align-items': 'center',
        'justify-content': 'center',
      }}
    >
      <div class={styles.text}>{t('Link sent, check your email')}</div>
      <div>
        <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
          {t('Go to main page')}
        </button>
      </div>
    </div>
  )
}
