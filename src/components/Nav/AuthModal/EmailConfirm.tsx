import { clsx } from 'clsx'
import { Show, createEffect, createSignal } from 'solid-js'

import { useUI } from '~/context/ui'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'

import { email, setEmail } from './sharedLogic'

import { useSearchParams } from '@solidjs/router'
import styles from './AuthModal.module.scss'

export type ConfirmEmailSearchParams = {
  access_token?: string
  token?: string
}

export const EmailConfirm = () => {
  const { t } = useLocalize()
  const { hideModal } = useUI()
  const [, changeSearchParams] = useSearchParams<ConfirmEmailSearchParams>()
  const { session, authError } = useSession()
  const [emailConfirmed, setEmailConfirmed] = createSignal(false)

  createEffect(() => {
    const email = session()?.user?.email
    const isVerified = session()?.user?.email_verified

    if (email) {
      setEmail(email.toLowerCase())
      if (isVerified) setEmailConfirmed(isVerified)
      if (authError()) {
        changeSearchParams({}, { replace: true })
      }
    }

    if (authError()) {
      console.debug('[AuthModal.EmailConfirm] auth error:', authError())
    }
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
