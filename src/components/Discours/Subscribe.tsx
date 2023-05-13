import { createSignal, Show } from 'solid-js'
import styles from './Subscribe.module.scss'

import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'
import { isValidEmail } from '../../utils/validators'

export default () => {
  const { t } = useLocalize()

  const [title, setTitle] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [emailError, setEmailError] = createSignal<string>(null)

  const validate = (): boolean => {
    if (!email()) {
      setEmailError(t('Please enter email'))
      return false
    }

    if (!isValidEmail(email())) {
      setEmailError(t('Please check your email address'))
      return false
    }

    setEmailError(null)
    return true
  }

  const subscribe = async (event: SubmitEvent) => {
    event.preventDefault()

    if (!validate()) return

    setTitle(t('...subscribing'))

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    }

    const response = await fetch('/api/newsletter', requestOptions)

    if (response.ok) {
      setTitle(t('You are subscribed'))
    } else {
      if (response.status === 400) {
        setEmailError(t('Please check your email address'))
      } else {
        setEmailError(t('Something went wrong, please try again'))
      }

      setTitle('')
    }
  }

  return (
    <form class={styles.form} onSubmit={subscribe} novalidate>
      <Show when={!title()} fallback={title()}>
        <div class={styles.controls}>
          <input
            type="email"
            name="email"
            value={email()}
            onChange={(e) => setEmail(e.target.value)}
            class={styles.input}
            placeholder={t('Fill email')}
          />
          <button type="submit" class={clsx(styles.button, 'button--light')}>
            {t('Subscribe')}
          </button>
        </div>
        <Show when={emailError()}>
          <div class={styles.error}>{emailError()}</div>
        </Show>
      </Show>
    </form>
  )
}
