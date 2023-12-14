import type { ConfirmEmailSearchParams } from './types'

import { clsx } from 'clsx'
import { createMemo, createSignal, onMount, Show } from 'solid-js'

import { useAuthorizer } from '../../../context/authorizer'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { ApiError } from '../../../graphql/error'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'

import styles from './AuthModal.module.scss'

export const EmailConfirm = () => {
  const { t } = useLocalize()
  const {
    actions: { confirmEmail },
  } = useSession()
  const [{ user }] = useAuthorizer()

  const [isTokenExpired, setIsTokenExpired] = createSignal(false)
  const [isTokenInvalid, setIsTokenInvalid] = createSignal(false)

  const confirmedEmail = createMemo(() => user?.email || '')

  const { searchParams } = useRouter<ConfirmEmailSearchParams>()

  onMount(async () => {
    const token = searchParams().token
    try {
      await confirmEmail({ token })
    } catch (error) {
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
  })

  return (
    <div>
      {/* TODO: texts */}
      <Show when={isTokenExpired()}>
        <div class={styles.title}>Ссылка больше не действительна</div>
        <div class={styles.text}>
          <a href="/?modal=auth&mode=login">
            {/*TODO: temp solution, should be send link again, but we don't have email here*/}
            Вход
          </a>
        </div>
      </Show>
      <Show when={isTokenInvalid()}>
        <div class={styles.title}>Неправильная ссылка</div>
        <div class={styles.text}>
          <a href="/?modal=auth&mode=login">
            {/*TODO: temp solution, should be send link again, but we don't have email here*/}
            Вход
          </a>
        </div>
      </Show>
      <Show when={Boolean(confirmedEmail())}>
        <div class={styles.title}>{t('Hooray! Welcome!')}</div>
        <div class={styles.text}>
          {t("You've confirmed email")} {confirmedEmail()}
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
