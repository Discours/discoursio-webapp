import { createSignal, onMount } from 'solid-js'
import './Subscribe.scss'
import { t } from '../../utils/intl'

export default () => {
  let emailElement: HTMLInputElement | undefined
  const [title, setTitle] = createSignal('')
  const subscribe = async () => {
    setTitle(t('...subscribing'))
    const r = await fetch(`/maillist?email=${emailElement?.value}`)
    setTitle(r.ok ? t('You are subscribed') : t('Subscribe'))
  }
  onMount(() => setTitle(t('Subscribe')))
  return (
    <div class="subscribe-form">
      <input type="email" name="email" ref={emailElement} placeholder="email" value={title()} />
      <button class="button--light" onClick={() => emailElement?.value && subscribe()}>
        {t('Subscribe')}
      </button>
    </div>
  )
}
