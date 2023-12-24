import type { ConfirmEmailSearchParams } from './types'

import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'

import styles from './AuthModal.module.scss'

export const EmailConfirm = () => {
  const { t } = useLocalize()
  const { searchParams } = useRouter<ConfirmEmailSearchParams>()
  const {
    actions: { confirmEmail },
    session,
  } = useSession()
  const [isTokenExpired, setIsTokenExpired] = createSignal(false) // TODO: handle expired token in context/session
  const [isTokenInvalid, setIsTokenInvalid] = createSignal(false) // TODO: handle invalid token in context/session

  createEffect(async () => {
    const token = searchParams()?.access_token
    if (token) await confirmEmail({ token })
  })

  const email = createMemo(() => session()?.user?.email)
  const confirmedEmail = createMemo(() => session()?.user?.email_verified)

  return (
    <div>
      {/* TODO: texts */}
      <Show when={isTokenExpired()}>
        <div class={styles.title}>Ссылка больше не действительна</div>
        <div class={styles.text}>
          <a href="/?modal=auth&mode=login">
            {/*TODO: temp solution, should be send link again */}
            Вход
          </a>
        </div>
      </Show>
      <Show when={isTokenInvalid()}>
        <div class={styles.title}>Неправильная ссылка</div>
        <div class={styles.text}>
          <a href="/?modal=auth&mode=login">
            {/*TODO: temp solution, should be send link again */}
            Вход
          </a>
        </div>
      </Show>
      <Show when={confirmedEmail()}>
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
