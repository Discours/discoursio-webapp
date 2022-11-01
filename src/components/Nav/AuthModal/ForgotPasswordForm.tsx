import { t } from '../../../utils/intl'
import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { createSignal, JSX, Show } from 'solid-js'
import { useRouter } from '../../../stores/router'
import { email, setEmail } from './sharedLogic'
import type { AuthModalSearchParams } from './types'
import { isValidEmail } from './validators'
import { signSendLink } from '../../../stores/auth'
import { locale } from '../../../stores/ui'

type FormFields = {
  email: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const ForgotPasswordForm = () => {
  const { changeSearchParam } = useRouter<AuthModalSearchParams>()

  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail)
  }

  const [submitError, setSubmitError] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    if (!email()) {
      newValidationErrors.email = t('Please enter email')
    } else if (!isValidEmail(email())) {
      newValidationErrors.email = t('Invalid email')
    }

    setValidationErrors(newValidationErrors)

    const isValid = Object.keys(newValidationErrors).length === 0

    if (!isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      setSubmitError('')
      signSendLink({ email: email(), lang: locale() })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h4>{t('Forgot password?')}</h4>
      <div class={styles.authSubtitle}>{t('Everything is ok, please give us your email address')}</div>
      <Show when={submitError()}>
        <div class={styles.authInfo}>
          <ul>
            <li class={styles.warn}>{submitError()}</li>
          </ul>
        </div>
      </Show>
      <Show when={validationErrors().email}>
        <div class={styles.validationError}>{validationErrors().email}</div>
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

      <div>
        <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
          {isSubmitting() ? '...' : t('Restore password')}
        </button>
      </div>
      <div class={styles.authControl}>
        <span class={styles.authLink} onClick={() => changeSearchParam('mode', 'login')}>
          {t('I know the password')}
        </span>
      </div>
    </form>
  )
}
