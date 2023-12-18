import type { ConfirmEmailSearchParams } from './types'

import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { ApiError } from '../../../graphql/error'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'

import styles from './AuthModal.module.scss'

export const EmailConfirm = () => {
  const { t } = useLocalize()
  const {
    actions: { confirmEmail, loadSession, loadAuthor },
    session,
  } = useSession()
  const [confirmedEmail, setConfirmedEmail] = createSignal<boolean>(false)

  const [isTokenExpired, setIsTokenExpired] = createSignal(false)
  const [isTokenInvalid, setIsTokenInvalid] = createSignal(false)
  const { searchParams, changeSearchParam } = useRouter<ConfirmEmailSearchParams>()

  onMount(async () => {
    const token = searchParams().access_token
    if (token) {
      changeSearchParam({})
      try {
        await confirmEmail({ token })
        await loadSession()
        await loadAuthor()
      } catch (error) {
        // TODO: adapt this code to authorizer
        if (error instanceof ApiError) {
          if (error.code === 'token_expired') {
            setIsTokenExpired(true)
            return
          }

          if (error.code === 'token_invalid') {
            setIsTokenInvalid(true)
            return
          }
        }

        console.log(error)
      }
    }
  })

  createEffect(() => {
    const confirmed = session()?.user?.email_verified
    if (confirmed) {
      console.debug(`[EmailConfirm] email successfully verified`)
      setConfirmedEmail(confirmed)
    }
  })

  const email = createMemo(() => session()?.user?.email)

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
