import { createSignal, JSX, Show } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { isValidEmail } from '../../utils/validators'
import { Button } from '../_shared/Button'

import styles from './Subscribe.module.scss'

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

  const handleInput: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) => {
    setEmailError(null)
    setEmail(event.target.value)
  }

  const handleSubmit = async (event: SubmitEvent) => {
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
    <form class={styles.form} onSubmit={handleSubmit} novalidate>
      <Show when={!title()} fallback={title()}>
        <div class={styles.controls}>
          <input
            type="email"
            name="email"
            value={email()}
            onInput={handleInput}
            class={styles.input}
            placeholder={t('Fill email')}
          />
          <Button class={styles.button} type="submit" variant="secondary" value={t('Subscribe')} />
        </div>
        <Show when={emailError()}>
          <div class={styles.error}>{emailError()}</div>
        </Show>
      </Show>
    </form>
  )
}
