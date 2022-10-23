import styles from './ConfirmEmail.module.scss'
import authModalStyles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { t } from '../../../utils/intl'
import { hideModal } from '../../../stores/ui'
import { onMount } from 'solid-js'
import { useRouter } from '../../../stores/router'
import { confirmEmail } from '../../../stores/auth'

type ConfirmEmailSearchParams = {
  token: string
}

export const ConfirmEmail = () => {
  const confirmedEmail = 'test@test.com'

  const { searchParams } = useRouter<ConfirmEmailSearchParams>()

  onMount(async () => {
    const token = searchParams().token
    try {
      await confirmEmail(token)
    } catch (error) {
      console.log(error)
    }
  })

  return (
    <div>
      <div class={styles.title}>{t('Hooray! Welcome!')}</div>
      <div class={styles.text}>
        {t("You've confirmed email")} {confirmedEmail}
      </div>
      <div>
        <button class={clsx('button', authModalStyles.submitButton)} onClick={() => hideModal()}>
          Перейти на главную
        </button>
      </div>
    </div>
  )
}
