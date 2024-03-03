import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { JSX, Show, createSignal, onMount } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useRouter } from '../../../stores/router'
import { validateEmail } from '../../../utils/validateEmail'

import { email, setEmail } from './sharedLogic'

import styles from './AuthModal.module.scss'

type FormFields = {
  email: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const SendResetLinkForm = () => {
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail.toLowerCase())
  }
  const { forgotPassword } = useSession()
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  const [isUserNotFound, setIsUserNotFound] = createSignal(false)
  const authFormRef: { current: HTMLFormElement } = { current: null }
  const [message, setMessage] = createSignal<string>('')

  const handleSubmit = async (event: Event) => {
    event.preventDefault()
    setIsUserNotFound(false)
    const newValidationErrors: ValidationErrors = {}

    if (!email()) {
      newValidationErrors.email = t('Please enter email')
    } else if (!validateEmail(email())) {
      newValidationErrors.email = t('Invalid email')
    }

    setValidationErrors(newValidationErrors)
    const isValid = Object.keys(newValidationErrors).length === 0

    if (!isValid) {
      authFormRef.current
        .querySelector<HTMLInputElement>(`input[name="${Object.keys(newValidationErrors)[0]}"]`)
        .focus()

      return
    }

    setIsSubmitting(true)
    try {
      const { data, errors } = await forgotPassword({
        email: email(),
        redirect_uri: window.location.origin,
      })
      console.debug('[SendResetLinkForm] authorizer response:', data)
      if (errors?.some((error) => error.message.includes('bad user credentials'))) {
        setIsUserNotFound(true)
      }
      if (data.message) setMessage(data.message)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  onMount(() => {
    if (email()) {
      console.info('[SendResetLinkForm] email detected')
    }
  })

  return (
    <form
      onSubmit={handleSubmit}
      class={clsx(styles.authForm, styles.authFormForgetPassword)}
      ref={(el) => (authFormRef.current = el)}
    >
      <div>
        <h4>{t('Set the new password')}</h4>
        <div class={styles.authSubtitle}>{t(message()) || t('Please give us your email address')}</div>
        <div
          class={clsx('pretty-form__item', {
            'pretty-form__item--error': validationErrors().email,
          })}
        >
          <input
            disabled={Boolean(message())}
            id="email"
            name="email"
            autocomplete="email"
            type="email"
            value={email()}
            placeholder={t('Email')}
            onChange={(event) => handleEmailInput(event.currentTarget.value)}
          />
          <label for="email">{t('Email')}</label>
          <Show when={isUserNotFound()}>
            <div class={styles.validationError}>
              {t("We can't find you, check email or")}{' '}
              <span
                class={'link'}
                onClick={() =>
                  changeSearchParams({
                    mode: 'login',
                  })
                }
              >
                {t('register')}
              </span>
            </div>
          </Show>
          <Show when={validationErrors().email}>
            <div class={styles.validationError}>{validationErrors().email}</div>
          </Show>
        </div>

        <div style={{ 'margin-top': '5rem' }}>
          <button
            class={clsx('button', styles.submitButton)}
            disabled={isSubmitting() || Boolean(message())}
            type="submit"
          >
            {isSubmitting() ? '...' : t('Send')}
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
            {t('I know the password')}
          </span>
        </div>
      </div>
    </form>
  )
}
