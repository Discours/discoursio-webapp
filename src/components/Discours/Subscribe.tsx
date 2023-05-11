import { createSignal } from 'solid-js'
import styles from './Subscribe.module.scss'

import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'

export default () => {
  const { t } = useLocalize()
  let emailElement: HTMLInputElement | undefined
  const [title, setTitle] = createSignal('')
  const subscribe = async () => {
    setTitle(t('...subscribing'))

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: emailElement?.value
      })
    }

    const r = await fetch('/api/newsletter', requestOptions)
    setTitle(r.ok ? t('You are subscribed') : '')
  }

  return (
    <div class={styles.subscribeForm}>
      <label for="email">{title()}</label>
      <input type="email" name="email" ref={emailElement} placeholder={t('Fill email')} />
      <button
        class={clsx(styles.button, 'button--light')}
        onClick={() => emailElement?.value && subscribe()}
      >
        {t('Subscribe')}
      </button>
    </div>
  )
}
