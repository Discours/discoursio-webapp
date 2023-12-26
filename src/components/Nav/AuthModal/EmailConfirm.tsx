import { clsx } from 'clsx'
import { createEffect, createSignal, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'

import styles from './AuthModal.module.scss'

export const EmailConfirm = () => {
  const { t } = useLocalize()
  const { changeSearchParams } = useRouter()
  const { session, authError } = useSession()
  const [email, setEmail] = createSignal('')
  const [emailConfirmed, setEmailConfirmed] = createSignal(false)
  createEffect(() => {
    setEmail(session()?.user?.email)
    setEmailConfirmed(session()?.user?.email_verified)
  })

  createEffect(() => {
    if (emailConfirmed() || authError()) {
      changeSearchParams({}, true)
    }
  })

  return (
    <div>
      <Show when={authError()}>
        <div class={styles.title}>{authError()}</div>
        <div class={styles.text}>
          <a href="/?modal=auth&mode=login">
            {/*TODO: temp solution, should be send link again */}
            {t('Enter')}
          </a>
        </div>
      </Show>
      <Show when={emailConfirmed()}>
        <div class={styles.title}>{t('Hooray! Welcome!')}</div>
        <div class={styles.text}>
          {t("You've confirmed email")} {email()}
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
