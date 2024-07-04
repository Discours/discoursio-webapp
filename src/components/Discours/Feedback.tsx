import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { Button } from '../_shared/Button'

export const Feedback = () => {
  const { t } = useLocalize()
  const { hideModal } = useUI()
  const action = '/user/feedback'
  const method = 'post'
  let msgElement: HTMLTextAreaElement | undefined
  let contactElement: HTMLInputElement | undefined
  const submit = async () => {
    await fetch(action, {
      method,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ contact: contactElement?.value, message: msgElement?.textContent })
    })
    hideModal()
  }

  return (
    <form method={method} action={action} onSubmit={submit}>
      <input type="text" name="contact" placeholder="email" ref={contactElement} />
      <textarea cols="12" name="message" rows="3" placeholder={t('Write to us')} ref={msgElement} />
      <Button value={'Отправить'} />
    </form>
  )
}
