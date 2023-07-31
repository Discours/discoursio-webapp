import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { SocialProviders } from './SocialProviders'
import { ApiError } from '../../../utils/apiClient'
import { createSignal, Show } from 'solid-js'
import { email, setEmail } from './sharedLogic'
import { useRouter } from '../../../stores/router'
import type { AuthModalSearchParams } from './types'
import { hideModal } from '../../../stores/ui'
import { useSession } from '../../../context/session'
import { signSendLink } from '../../../stores/auth'
import { validateEmail } from '../../../utils/validateEmail'
import { useSnackbar } from '../../../context/snackbar'
import { useLocalize } from '../../../context/localize'
import { Icon } from '../../_shared/Icon'
import { AuthModalHeader } from './AuthModalHeader'

type FormFields = {
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string>>

export const LoginForm = () => {
  const { t, lang } = useLocalize()

  const [submitError, setSubmitError] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  // TODO: better solution for interactive error messages
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = createSignal(false)
  const [isLinkSent, setIsLinkSent] = createSignal(false)
  const [showPassword, setShowPassword] = createSignal(false)

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const {
    actions: { signIn }
  } = useSession()

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

  const handleSendLinkAgainClick = async (event: Event) => {
    event.preventDefault()
    setIsEmailNotConfirmed(false)
    setSubmitError('')
    setIsLinkSent(true)
    const result = await signSendLink({ email: email(), lang: lang(), template: 'email_confirmation' })
    if (result.error) setSubmitError(result.error)
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setIsLinkSent(false)
    setIsEmailNotConfirmed(false)
    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    if (!email()) {
      newValidationErrors.email = t('Please enter email')
    } else if (!validateEmail(email())) {
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
      hideModal()
      showSnackbar({ body: t('Welcome!') })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'email_not_confirmed') {
          setSubmitError(t('Please, confirm email'))
          setIsEmailNotConfirmed(true)
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
    <form onSubmit={handleSubmit} class={styles.authForm}>
      <div>
        <AuthModalHeader modalType="login" />
        <Show when={submitError()}>
          <div class={styles.authInfo}>
            <div class={styles.warn}>{submitError()}</div>
            <Show when={isEmailNotConfirmed()}>
              <a href="#" onClick={handleSendLinkAgainClick}>
                {t('Send link again')}
              </a>
            </Show>
          </div>
        </Show>
        <Show when={isLinkSent()}>
          <div class={styles.authInfo}>{t('Link sent, check your email')}</div>
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
            type={showPassword() ? 'text' : 'password'}
            placeholder={t('Password')}
            onInput={(event) => handlePasswordInput(event.currentTarget.value)}
          />
          <label for="password">{t('Password')}</label>
          <button
            type="button"
            class={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword())}
          >
            <Icon class={styles.passwordToggleIcon} name={showPassword() ? 'eye-off' : 'eye'} />
          </button>
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
      </div>

      <div>
        <SocialProviders />

        <div class={styles.authControl}>
          <span class={styles.authLink} onClick={() => changeSearchParam('mode', 'register')}>
            {t('I have no account yet')}
          </span>
        </div>
      </div>
    </form>
  )
}
