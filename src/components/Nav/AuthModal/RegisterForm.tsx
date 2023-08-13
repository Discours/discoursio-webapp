import { Show, createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { SocialProviders } from './SocialProviders'
import { ApiError } from '../../../utils/apiClient'
import { email, setEmail } from './sharedLogic'
import { useRouter } from '../../../stores/router'
import type { AuthModalSearchParams } from './types'
import { hideModal } from '../../../stores/ui'
import { checkEmail, useEmailChecks } from '../../../stores/emailChecks'
import { register } from '../../../stores/auth'
import { useLocalize } from '../../../context/localize'
import { validateEmail } from '../../../utils/validateEmail'
import { AuthModalHeader } from './AuthModalHeader'

type FormFields = {
  fullName: string
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const RegisterForm = () => {
  const { changeSearchParam } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const { emailChecks } = useEmailChecks()

  const [submitError, setSubmitError] = createSignal('')
  const [fullName, setFullName] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [isSuccess, setIsSuccess] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})

  const authFormRef: { current: HTMLFormElement } = { current: null }

  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail)
  }

  const handleEmailBlur = () => {
    if (validateEmail(email())) {
      checkEmail(email())
    }
  }

  function isValidPassword(passwordToCheck) {
    const minLength = 8
    const hasNumber = /\d/
    const hasSpecial = /[!#$%&*@^]/

    if (passwordToCheck.length < minLength) {
      return t('Password should be at least 8 characters')
    }
    if (!hasNumber.test(passwordToCheck)) {
      return t('Password should contain at least one number')
    }
    if (!hasSpecial.test(passwordToCheck)) {
      return t('Password should contain at least one special character: !@#$%^&*')
    }
    return null
  }

  const handlePasswordInput = (newPassword: string) => {
    const passwordError = isValidPassword(newPassword)
    if (passwordError) {
      setValidationErrors((errors) => ({ ...errors, password: passwordError }))
    } else {
      setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    }
    setPassword(newPassword)
  }

  const handleNameInput = (newPasswordCopy: string) => {
    setValidationErrors(({ fullName: _notNeeded, ...rest }) => rest)
    setFullName(newPasswordCopy)
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    const cleanName = fullName().trim()
    const cleanEmail = email().trim()

    if (!cleanName) {
      newValidationErrors.fullName = t('Please enter a name to sign your comments and publication')
    }

    if (!cleanEmail) {
      newValidationErrors.email = t('Please enter email')
    } else if (!validateEmail(email())) {
      newValidationErrors.email = t('Invalid email')
    }

    if (!password()) {
      newValidationErrors.password = t('Please enter password')
    }

    setValidationErrors(newValidationErrors)

    const emailCheckResult = await checkEmail(cleanEmail)

    const isValid = Object.keys(newValidationErrors).length === 0 && !emailCheckResult

    if (!isValid) {
      authFormRef.current
        .querySelector<HTMLInputElement>(`input[name="${Object.keys(newValidationErrors)[0]}"]`)
        .focus()

      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        password: password()
      })

      setIsSuccess(true)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'user_already_exists') {
        return
      }

      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Show when={!isSuccess()}>
        <form onSubmit={handleSubmit} class={styles.authForm} ref={(el) => (authFormRef.current = el)}>
          <div>
            <AuthModalHeader modalType="register" />
            <Show when={submitError()}>
              <div class={styles.authInfo}>
                <ul>
                  <li class={styles.warn}>{submitError()}</li>
                </ul>
              </div>
            </Show>
            <div
              class={clsx('pretty-form__item', {
                'pretty-form__item--error': validationErrors().fullName
              })}
            >
              <input
                name="fullName"
                type="text"
                placeholder={t('Full name')}
                autocomplete=""
                onInput={(event) => handleNameInput(event.currentTarget.value)}
              />
              <label for="name">{t('Full name')}</label>
            </div>
            <Show when={validationErrors().fullName}>
              <div class={styles.validationError}>{validationErrors().fullName}</div>
            </Show>
            <div
              class={clsx('pretty-form__item', {
                'pretty-form__item--error': validationErrors().email
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
                onBlur={handleEmailBlur}
              />
              <label for="email">{t('Email')}</label>
            </div>
            <Show when={validationErrors().email}>
              <div class={styles.validationError}>{validationErrors().email}</div>
            </Show>
            <Show when={emailChecks()[email()]}>
              <div class={styles.validationError}>
                {t("This email is already taken. If it's you")},{' '}
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    changeSearchParam('mode', 'login')
                  }}
                >
                  {t('enter')}
                </a>
              </div>
            </Show>
            <div
              class={clsx('pretty-form__item', {
                'pretty-form__item--error': validationErrors().password
              })}
            >
              <input
                id="password"
                name="password"
                autocomplete="current-password"
                type="password"
                placeholder={t('Password')}
                onInput={(event) => handlePasswordInput(event.currentTarget.value)}
              />
              <label for="password">{t('Password')}</label>
            </div>
            <Show when={validationErrors().password}>
              <div class={clsx(styles.registerPassword, styles.validationError)}>
                {validationErrors().password}
              </div>
            </Show>

            <div>
              <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
                {isSubmitting() ? '...' : t('Join')}
              </button>
            </div>
          </div>

          <div>
            <SocialProviders />

            <div class={styles.authControl}>
              <span class={styles.authLink} onClick={() => changeSearchParam('mode', 'login')}>
                {t('I have an account')}
              </span>
            </div>
          </div>
        </form>
      </Show>
      <Show when={isSuccess()}>
        <div class={styles.title}>{t('Almost done! Check your email.')}</div>
        <div class={styles.text}>{t("We've sent you a message with a link to enter our website.")}</div>
        <div>
          <button class={clsx('button', styles.submitButton)} onClick={() => hideModal()}>
            {t('Back to main page')}
          </button>
        </div>
      </Show>
    </>
  )
}
