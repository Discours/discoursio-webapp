import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { createSignal, JSX, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'
import { validatePassword } from '../../../utils/validatePassword'

import { PasswordField } from './PasswordField'

import styles from './AuthModal.module.scss'

type FormFields = {
  password: string
  repeatPassword: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const ChangePasswordForm = () => {
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  const [newPassword, setNewPassword] = createSignal<string>()
  const [isSuccess, setIsSuccess] = createSignal(false)

  const authFormRef: { current: HTMLFormElement } = { current: null }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()
    setIsSubmitting(true)
    // Fake change password logic
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1000)
  }

  const handlePasswordInput = (value) => {
    const passwordError = validatePassword(value)
    if (passwordError) {
      setValidationErrors((errors) => ({ ...errors, password: t(passwordError) }))
    } else {
      setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    }
    setNewPassword(value)
  }

  const handlePasswordCopyInput = (value) => {
    console.log('!!! B:', value)
    const passwordError = () => {
      if (value !== newPassword()) {
        return 'Пароли должны совпадать'
      }
      return validatePassword(value)
    }

    if (passwordError()) {
      setValidationErrors((errors) => ({ ...errors, repeatPassword: t(passwordError()) }))
    } else {
      setValidationErrors(({ repeatPassword: _notNeeded, ...rest }) => rest)
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
              error={validationErrors().password}
              value={(value) => handlePasswordInput(value)}
            />
            <PasswordField
              error={validationErrors().repeatPassword}
              value={(value) => handlePasswordCopyInput(value)}
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
          <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
            {t('Back to main page')}
          </button>
        </div>
      </Show>
    </>
  )
}
