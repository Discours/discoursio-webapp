import './Confirmed.scss'
import { onMount } from 'solid-js'

import { useLocalize } from '../../context/localize'

export const Confirmed = (props: { token?: string }) => {
  const { t } = useLocalize()
  onMount(() => {
    const token = props.token ?? document.cookie.split(';').at(0).replace('token=', '')
    window.addEventListener('mousemove', () => window.close())
    window.addEventListener('keydown', () => window.close())
    window.addEventListener('click', () => window.close())
    localStorage.setItem('token', token)
  })
  return (
    <>
      <div class="center">{t('You was successfully authorized')}</div>
    </>
  )
}
