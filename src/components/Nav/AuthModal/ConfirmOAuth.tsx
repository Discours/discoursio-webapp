import styles from './ConfirmEmail.module.scss'
import authModalStyles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { t } from '../../../utils/intl'
import { hideModal } from '../../../stores/ui'
import { onMount } from 'solid-js'
import { useRouter } from '../../../stores/router'

type ConfirmOAuthSearchParams = {
  token: string
}

export const ConfirmOAuth = () => {
  const { searchParams } = useRouter<ConfirmOAuthSearchParams>()

  onMount(async () => {
    console.debug('[confirm-oauth] params', searchParams())
    const token = searchParams().token
    localStorage.setItem('token', token)
    window.addEventListener('mousemove', () => window.close())
    window.addEventListener('keydown', () => window.close())
    window.addEventListener('click', () => window.close())
  })

  return (
    <div>
      <div class={styles.title}>{t('Hooray! Welcome!')}</div>
      <div class={styles.text}>
        {t("You've confirmed your account")} { /* TODO: get '%username%' */ }
      </div>
      <div>
        <button class={clsx('button', authModalStyles.submitButton)} onClick={() => hideModal()}>
          {t('Back to mainpage')}
        </button>
      </div>
    </div>
  )
}
