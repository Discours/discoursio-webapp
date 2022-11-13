import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { t } from '../../../utils/intl'
import { hideModal } from '../../../stores/ui'
import { createMemo, onMount, Show } from 'solid-js'
import { useRouter } from '../../../stores/router'
import type { ConfirmEmailSearchParams } from './types'
import { useAuth } from '../../../context/auth'

export const EmailConfirm = () => {
  const {
    session,
    actions: { confirmEmail }
  } = useAuth()

  const confirmedEmail = createMemo(() => session()?.user?.email || '')

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
      <Show when={Boolean(confirmedEmail())}>
        <div class={styles.text}>
          {t("You've confirmed email")} {confirmedEmail()}
        </div>
      </Show>
      <div>
        <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
          {t('Go to main page')}
        </button>
      </div>
    </div>
  )
}
