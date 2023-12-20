import type { AuthModalSearchParams } from './types'

import { clsx } from 'clsx'
import { createSignal, JSX, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { signSendLink } from '../../../stores/auth'
import { useRouter } from '../../../stores/router'
import { ApiError } from '../../../utils/apiClient'
import { validateEmail } from '../../../utils/validateEmail'
import { Icon } from '../../_shared/Icon'

import { email, setEmail } from './sharedLogic'

import styles from './AuthModal.module.scss'

type FormFields = {
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const ChangePasswordForm = () => {
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()
  const [submitError, setSubmitError] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})
  const [isUserNotFount, setIsUserNotFound] = createSignal(false)

  const authFormRef: { current: HTMLFormElement } = { current: null }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setSubmitError('')
    const newValidationErrors: ValidationErrors = {}
  }

  const handlePasswordAInput = () => {
    console.log('!!! A:')
  }

  const handlePasswordBInput = () => {
    console.log('!!! B:')
  }

  return (
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

        <div
          class={clsx('pretty-form__item', {
            'pretty-form__item--error': validationErrors().password,
          })}
        >
          <input
            id="password"
            name="password"
            autocomplete="current-password"
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
          <Show when={validationErrors().password}>
            <div class={clsx(styles.registerPassword, styles.validationError)}>
              {validationErrors().password}
            </div>
          </Show>
        </div>

        <div
          class={clsx('pretty-form__item', {
            'pretty-form__item--error': validationErrors().password,
          })}
        >
          <input
            id="password"
            name="password"
            autocomplete="current-password"
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
          <Show when={validationErrors().password}>
            <div class={clsx(styles.registerPassword, styles.validationError)}>
              {validationErrors().password}
            </div>
          </Show>
        </div>

        <div>
          <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
            {isSubmitting() ? '...' : t('Restore password')}
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
