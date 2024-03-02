import { clsx } from 'clsx'
import { Show, createEffect, createSignal, on } from 'solid-js'

import { useLocalize } from '../../../../context/localize'
import { Icon } from '../../../_shared/Icon'

import styles from './PasswordField.module.scss'

type Props = {
  class?: string
  disabled?: boolean
  placeholder?: string
  errorMessage?: (error: string) => void
  onInput: (value: string) => void
  onBlur?: (value: string) => void
  variant?: 'login' | 'registration'
  disableAutocomplete?: boolean
}

const minLength = 8
const hasNumber = /\d/
const hasSpecial = /[!#$%&*@^]/

export const PasswordField = (props: Props) => {
  const { t } = useLocalize()
  const [showPassword, setShowPassword] = createSignal(false)
  const [error, setError] = createSignal<string>()

  const validatePassword = (passwordToCheck) => {
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

  const handleInputBlur = (value: string) => {
    if (props.variant === 'login') {
      return props.onBlur(value)
    }
    if (value.length < 1) {
      return
    }

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
      <div class="pretty-form__item">
        <input
          id="password"
          name="password"
          disabled={props.disabled}
          autocomplete={props.disableAutocomplete ? "one-time-code" : "current-password"}
          type={showPassword() ? "text" : "password"}
          placeholder={props.placeholder || t("Password")}
          onBlur={(event) => handleInputBlur(event.currentTarget.value)}
        />
        <label for="password">{t("Password")}</label>
        <button
          type="button"
          class={styles.passwordToggle}
          onClick={() => setShowPassword(!showPassword())}
        >
          <Icon class={styles.passwordToggleIcon} name={showPassword() ? "eye-off" : "eye"} />
        </button>
        <Show when={error()}>
          <div class={clsx(styles.registerPassword, styles.validationError)}>{error()}</div>
        </Show>
      </div>
    </div>
  );
}
