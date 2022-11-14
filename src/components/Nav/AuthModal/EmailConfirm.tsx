import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { t } from '../../../utils/intl'
import { hideModal, locale } from '../../../stores/ui'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { handleClientRouteLinkClick, useRouter } from '../../../stores/router'
import type { ConfirmEmailSearchParams } from './types'
import { signSendLink, useAuth } from '../../../context/auth'
import { ApiError } from '../../../utils/apiClient'
import { email } from './sharedLogic'

export const EmailConfirm = () => {
  const {
    session,
    actions: { confirmEmail }
  } = useAuth()

  const [isTokenExpired, setIsTokenExpired] = createSignal(false)
  const [isTokenInvalid, setIsTokenInvalid] = createSignal(false)

  const confirmedEmail = createMemo(() => session()?.user?.email || '')

  const { searchParams } = useRouter<ConfirmEmailSearchParams>()

  onMount(async () => {
    const token = searchParams().token
    try {
      await confirmEmail(token)
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
          <a href="/?modal=auth&mode=login" class={styles.sendLink} onClick={handleClientRouteLinkClick}>
            {/*TODO: temp solution, should be send link again, but we don't have email here*/}
            Вход
          </a>
        </div>
      </Show>
      <Show when={isTokenInvalid()}>
        <div class={styles.title}>Неправильная ссылка</div>
        <div class={styles.text}>
          <a href="/?modal=auth&mode=login" class={styles.sendLink} onClick={handleClientRouteLinkClick}>
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
