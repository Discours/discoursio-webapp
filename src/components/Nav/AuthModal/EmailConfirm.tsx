import { clsx } from 'clsx'
import { Show, createEffect, createSignal } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'

import { email, setEmail } from './sharedLogic'

import styles from './AuthModal.module.scss'

export const EmailConfirm = () => {
  const { t } = useLocalize()
  const { changeSearchParams } = useRouter()
  const { session, authError } = useSession()
  const [emailConfirmed, setEmailConfirmed] = createSignal(false)

  createEffect(() => {
    const e = session()?.user?.email
    const v = session()?.user?.email_verified
    if (e) {
      setEmail(e.toLowerCase())
      if (v) setEmailConfirmed(v)
      if (authError()) {
        changeSearchParams({}, true)
      }
    }
  })

  createEffect(() => {
    if (authError()) console.debug('[AuthModal.EmailConfirm] auth error:', authError())
  })

  return (
    <div>
      <Show when={authError()}>
        <div class={styles.title}>{t('Error')}</div>
        <div class={styles.text}>{authError()}</div>
      </Show>
      <Show when={emailConfirmed()}>
        <div class={styles.title}>{t('Hooray! Welcome!')}</div>
        <div class={styles.text}>
          {t("You've confirmed email")} {email().toLowerCase()}
        </div>
        <div>
          <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
            {t('Go to main page')}
          </button>
        </div>
      </Show>
    </div>
  )
}
