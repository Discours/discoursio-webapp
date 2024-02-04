import { clsx } from 'clsx'
import { createEffect, createSignal, on, Show } from 'solid-js'

import { useLocalize } from '../../../../context/localize'
import { Icon } from '../../../_shared/Icon'

import styles from './PasswordField.module.scss'

type Props = {
  class?: string
  errorMessage?: (error: string) => void
  onInput: (value: string) => void
  variant?: 'login' | 'registration'
}

export const PasswordField = (props: Props) => {
  const { t } = useLocalize()
  const [showPassword, setShowPassword] = createSignal(false)
  const [error, setError] = createSignal<string>()

  const validatePassword = (passwordToCheck) => {
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

  const handleInputChange = (value) => {
    props.onInput(value)
    const errorValue = validatePassword(value)
    if (errorValue) {
      setError(errorValue)
    } else {
      setError()
    }
  }

  createEffect(
    on(
      () => error(),
      () => {
        props.errorMessage?.(error())
      },
      { defer: true },
    ),
  )

  return (
    <div class={clsx(styles.PassportField, props.class)}>
      <div
        class={clsx('pretty-form__item', {
          'pretty-form__item--error': error() && props.variant !== 'login',
        })}
      >
        <input
          id="password"
          name="password"
          autocomplete="current-password"
          type={showPassword() ? 'text' : 'password'}
          placeholder={t('Password')}
          onInput={(event) => handleInputChange(event.currentTarget.value)}
        />
        <label for="password">{t('Password')}</label>
        <button
          type="button"
          class={styles.passwordToggle}
          onClick={() => setShowPassword(!showPassword())}
        >
          <Icon class={styles.passwordToggleIcon} name={showPassword() ? 'eye-off' : 'eye'} />
        </button>
        <Show when={error() && props.variant !== 'login'}>
          <div class={clsx(styles.registerPassword, styles.validationError)}>{error()}</div>
        </Show>
      </div>
    </div>
  )
}
