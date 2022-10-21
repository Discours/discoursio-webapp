import { Show } from 'solid-js/web'
import { t } from '../../../utils/intl'
import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { SocialProviders } from './SocialProviders'
import { signIn } from '../../../stores/auth'
import { ApiError } from '../../../utils/apiClient'
import { createSignal } from 'solid-js'
import { isValidEmail } from './validators'
import { email, setEmail } from './sharedLogic'
import { useRouter } from '../../../stores/router'
import type { AuthModalSearchParams } from './types'

type FormFields = {
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string>>

export const LoginForm = () => {
  const [submitError, setSubmitError] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})

  const { changeSearchParam } = useRouter<AuthModalSearchParams>()

  const [password, setPassword] = createSignal('')

  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail)
  }

  const handlePasswordInput = (newPassword: string) => {
    setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    setPassword(newPassword)
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    if (!email()) {
      newValidationErrors.email = t('Please enter email')
    } else if (!isValidEmail(email())) {
      newValidationErrors.email = t('Invalid email')
    }

    if (!password()) {
      newValidationErrors.password = t('Please enter password')
    }

    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await signIn({ email: email(), password: password() })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'email_not_confirmed') {
          setSubmitError(t('Please, confirm email'))
          return
        }

        if (error.code === 'user_not_found') {
          setSubmitError(t('Something went wrong, check email and password'))
          return
        }
      }

      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h4>{t('Enter the Discours')}</h4>
      <Show when={submitError()}>
        <div class={styles.authInfo}>
          <ul>
            <li class={styles.warn}>{submitError()}</li>
          </ul>
        </div>
      </Show>
      <div class="pretty-form__item">
        <input
          id="email"
          name="email"
          autocomplete="email"
          type="email"
          value={email()}
          placeholder={t('Email')}
          onInput={(event) => handleEmailInput(event.currentTarget.value)}
        />
        <label for="email">{t('Email')}</label>
      </div>
      <Show when={validationErrors().email}>
        <div class={styles.validationError}>{validationErrors().email}</div>
      </Show>
      <div class="pretty-form__item">
        <input
          id="password"
          name="password"
          autocomplete="password"
          type="password"
          placeholder={t('Password')}
          onInput={(event) => handlePasswordInput(event.currentTarget.value)}
        />
        <label for="password">{t('Password')}</label>
      </div>
      <Show when={validationErrors().password}>
        <div class={styles.validationError}>{validationErrors().password}</div>
      </Show>
      <div>
        <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
          {isSubmitting() ? '...' : t('Enter')}
        </button>
      </div>
      <div class={styles.authActions}>
        <a
          href="#"
          onClick={(ev) => {
            ev.preventDefault()
            changeSearchParam('mode', 'forgot-password')
          }}
        >
          {t('Forgot password?')}
        </a>
      </div>

      <SocialProviders />

      <div class={styles.authControl}>
        <span class={styles.authLink} onClick={() => changeSearchParam('mode', 'register')}>
          {t('I have no account yet')}
        </span>
      </div>
    </form>
  )
}
