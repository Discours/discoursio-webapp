import { clsx } from 'clsx'
import styles from './EyedPasswordInput.module.scss'
import { Icon } from '../Icon'
import { createEffect, createSignal, onMount, Show } from 'solid-js'

type Props = {
  class?: string
  onInput: (value: string) => void
  initialValue?: string
  error?: string
}

export const EyedPasswordInput = (props: Props) => {
  const [passwordVisible, setPasswordVisible] = createSignal(false)
  const [password, setPassword] = createSignal(props.initialValue || '')

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible())
  }

  const handleBlur = () => {
    props.onInput(password())
  }
  onMount(() => handleBlur())

  return (
    <div
      class={clsx('pretty-form__item', styles.EyedPasswordInput, props.class, {
        'pretty-form__item--error': props.error,
      })}
    >
      <input
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        type={passwordVisible() ? 'text' : 'password'}
        onBlur={handleBlur}
        class={clsx(styles.passwordInput, 'nolabel')}
      />
      <button type="button" onClick={togglePasswordVisibility} class={styles.passwordToggleControl}>
        <Show when={passwordVisible()} fallback={<Icon name="password-open" />}>
          <Icon name="password-hide" />
        </Show>
      </button>
      <Show when={props.error}>
        <div class={styles.validationError}>{props.error}</div>
      </Show>
    </div>
  )
}
