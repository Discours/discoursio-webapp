import { clsx } from 'clsx'
import { createSignal, JSX, Show } from 'solid-js'

import { useLocalize } from '../../../../context/localize'
import { Icon } from '../../../_shared/Icon'

import styles from './PasswordField.module.scss'

type Props = {
  class?: string
  error?: string | JSX.Element
  value: (value: string) => void
  fieldForRepeat?: boolean
}

export const PasswordField = (props: Props) => {
  const { t } = useLocalize()
  const [showPassword, setShowPassword] = createSignal(false)

  return (
    <div class={clsx(styles.PassportField, props.class)}>
      <div
        class={clsx('pretty-form__item', {
          'pretty-form__item--error': props.error,
        })}
      >
        <input
          id="password"
          name="password"
          autocomplete="current-password"
          type={showPassword() ? 'text' : 'password'}
          placeholder={t('Password')}
          onInput={(event) => props.value(event.currentTarget.value)}
        />
        <label for="password">{t('Password')}</label>
        <button
          type="button"
          class={styles.passwordToggle}
          onClick={() => setShowPassword(!showPassword())}
        >
          <Icon class={styles.passwordToggleIcon} name={showPassword() ? 'eye-off' : 'eye'} />
        </button>
        <Show when={props.error}>
          <div class={clsx(styles.registerPassword, styles.validationError)}>{props.error}</div>
        </Show>
      </div>
    </div>
  )
}
