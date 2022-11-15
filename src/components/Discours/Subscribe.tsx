import { createSignal } from 'solid-js'
import styles from './Subscribe.module.scss'
import { t } from '../../utils/intl'
import { clsx } from 'clsx'

export default () => {
  let emailElement: HTMLInputElement | undefined
  const [title, setTitle] = createSignal('')
  const subscribe = async () => {
    setTitle(t('...subscribing'))
    const r = await fetch(`/maillist?email=${emailElement?.value}`)
    setTitle(r.ok ? t('You are subscribed') : '')
  }

  return (
    <div class={styles.subscribeForm}>
      <input type="email" name="email" ref={emailElement} placeholder={t('Fill email')} value={title()} />
      <button
        class={clsx(styles.button, 'button--light')}
        onClick={() => emailElement?.value && subscribe()}
      >
        {t('Subscribe')}
      </button>
    </div>
  )
}
