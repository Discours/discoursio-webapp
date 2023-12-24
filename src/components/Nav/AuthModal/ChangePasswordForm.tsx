import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { createSignal, JSX, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'

import { PasswordField } from './PasswordField'

import styles from './AuthModal.module.scss'

type FormFields = {
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const ChangePasswordForm = () => {
  const { searchParams, changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const {
    actions: { changePassword },
  } = useSession()
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  const [newPassword, setNewPassword] = createSignal<string>()
  const [passwordError, setPasswordError] = createSignal<string>()
  const [isSuccess, setIsSuccess] = createSignal(false)
  const authFormRef: { current: HTMLFormElement } = { current: null }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()
    setIsSubmitting(true)
    if (newPassword()) {
      await changePassword(newPassword(), searchParams()?.token)
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
      }, 1000)
    }
  }

  const handlePasswordInput = (value: string) => {
    setNewPassword(value)
    if (passwordError()) {
      setValidationErrors((errors) => ({ ...errors, password: passwordError() }))
    } else {
      setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    }
  }

  return (
    <>
      <Show when={!isSuccess()}>
        <form
          onSubmit={handleSubmit}
          class={clsx(styles.authForm, styles.authFormForgetPassword)}
          ref={(el) => (authFormRef.current = el)}
        >
          <div>
            <h4>{t('Enter a new password')}</h4>
            <div class={styles.authSubtitle}>
              {t(
                'Now you can enter a new password, it must contain at least 8 characters and not be the same as the previous password',
              )}
            </div>

            <PasswordField
              errorMessage={(err) => setPasswordError(err)}
              onInput={(value) => handlePasswordInput(value)}
            />

            <div>
              <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
                {isSubmitting() ? '...' : t('Change password')}
              </button>
            </div>
            <div class={styles.authControl}>
              <span
                class={styles.authLink}
                onClick={() =>
                  changeSearchParams({
                    mode: 'login',
                  })
                }
              >
                {t('Cancel')}
              </span>
            </div>
          </div>
        </form>
      </Show>
      <Show when={isSuccess()}>
        <div class={styles.title}>{t('Password updated!')}</div>
        <div class={styles.text}>{t('You can now login using your new password')}</div>
        <div>
          <button
            class={clsx('button', styles.submitButton)}
            onClick={() => changeSearchParams({ mode: 'login' })}
          >
            {t('Enter')}
          </button>
          <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
            {t('Back to main page')}
          </button>
        </div>
      </Show>
    </>
  )
}
