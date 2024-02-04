import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { Show, createSignal } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useSnackbar } from '../../../context/snackbar'
import { useRouter } from '../../../stores/router'
import { hideModal } from '../../../stores/ui'
import { validateEmail } from '../../../utils/validateEmail'

import { AuthModalHeader } from './AuthModalHeader'
import { PasswordField } from './PasswordField'
import { SocialProviders } from './SocialProviders'
import { email, setEmail } from './sharedLogic'

import styles from './AuthModal.module.scss'

type FormFields = {
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string>>

export const LoginForm = () => {
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const [submitError, setSubmitError] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [password, setPassword] = createSignal('')
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  // TODO: better solution for interactive error messages
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = createSignal(false)
  const [isLinkSent, setIsLinkSent] = createSignal(false)
  const authFormRef: { current: HTMLFormElement } = { current: null }
  const { showSnackbar } = useSnackbar()
  const { signIn } = useSession()

  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail.toLowerCase())
  }

  const handlePasswordInput = (newPassword: string) => {
    setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    setPassword(newPassword)
  }

  const handleSendLinkAgainClick = async (event: Event) => {
    event.preventDefault()

    setIsLinkSent(true)
    setIsEmailNotConfirmed(false)
    setSubmitError('')
    changeSearchParams({ mode: 'forgot-password' })
    // NOTE: temporary solution, needs logic in authorizer
    /* FIXME:
    const { authorizer } = useSession()
    const result = await authorizer().verifyEmail({ token })
    if (!result) setSubmitError('cant sign send link')
    */
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setIsLinkSent(false)
    setIsEmailNotConfirmed(false)
    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    const validateAndSetError = (field, message) => {
      if (!field()) {
        newValidationErrors[field.name] = t(message)
      }
    }

    validateAndSetError(email, 'Please enter email')
    validateAndSetError(() => validateEmail(email()), 'Invalid email')
    validateAndSetError(password, 'Please enter password')

    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors)

      authFormRef.current
        .querySelector<HTMLInputElement>(`input[name="${Object.keys(newValidationErrors)[0]}"]`)
        .focus()

      return
    }

    setIsSubmitting(true)

    try {
      const { errors } = await signIn({ email: email(), password: password() })
      if (errors?.length > 0) {
        if (errors.some((error) => error.message.includes('bad user credentials'))) {
          setValidationErrors((prev) => ({
            ...prev,
            password: t('Something went wrong, check email and password'),
          }))
        } else {
          setSubmitError(t('Error'))
        }
        return
      }
      hideModal()
      showSnackbar({ body: t('Welcome!') })
    } catch (error) {
      console.error(error)
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} class={styles.authForm} ref={(el) => (authFormRef.current = el)}>
      <div>
        <AuthModalHeader modalType="login" />
        <Show when={submitError()}>
          <div class={styles.authInfo}>
            <div class={styles.warn}>{submitError()}</div>
            <Show when={isEmailNotConfirmed()}>
              <span class={'link'} onClick={handleSendLinkAgainClick}>
                {t('Send link again')}
              </span>
            </Show>
          </div>
        </Show>
        <Show when={isLinkSent()}>
          <div class={styles.authInfo}>{t('Link sent, check your email')}</div>
        </Show>
        <div
          class={clsx('pretty-form__item', {
            'pretty-form__item--error': validationErrors().email,
          })}
        >
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
          <Show when={validationErrors().email}>
            <div class={styles.validationError}>{validationErrors().email}</div>
          </Show>
        </div>

        <PasswordField variant={'login'} onInput={(value) => handlePasswordInput(value)} />
        <Show when={validationErrors().password}>
          <div class={styles.validationError} style={{ position: 'static', 'font-size': '1.4rem' }}>
            {validationErrors().password}
          </div>
        </Show>

        <div>
          <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
            {isSubmitting() ? '...' : t('Enter')}
          </button>
        </div>
        <div class={styles.authActions}>
          <span
            class="link"
            onClick={() =>
              changeSearchParams({
                mode: 'forgot-password',
              })
            }
          >
            {t('Forgot password?')}
          </span>
        </div>
      </div>

      <div>
        <SocialProviders />

        <div class={styles.authControl}>
          <span
            class={styles.authLink}
            onClick={() =>
              changeSearchParams({
                mode: 'register',
              })
            }
          >
            {t('I have no account yet')}
          </span>
        </div>
      </div>
    </form>
  )
}
