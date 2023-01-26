import styles from './GrowingTextarea.module.scss'
import { showModal } from '../../../stores/ui'
import { createEffect, createSignal, Show } from 'solid-js'
import { t } from '../../../utils/intl'
import Button from '../Button'
import { clsx } from 'clsx'
import { useSession } from '../../../context/session'

type Props = {
  placeholder?: string
  submit?: (value: string) => void
  submitButtonText?: string
  cancelButtonText?: string
  loading?: boolean
  errorMessage?: string
  loginRequired?: boolean
}

let growArea // textarea autoresize ghost element

const GrowingTextarea = (props: Props) => {
  const { session } = useSession()
  const [inputText, setInputText] = createSignal<string | undefined>('')

  const handleChangeMessage = (event) => {
    setInputText(event.target.value)
  }
  createEffect(() => {
    growArea.dataset.replicatedValue = inputText()
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    props.submit(inputText())
    if (!props.errorMessage) {
      setInputText('')
    }
  }

  return (
    <form onSubmit={(event) => handleSubmit(event)} class={styles.GrowingTextarea}>
      <div class={styles.wrapper}>
        <div class={styles.growArea} ref={growArea}>
          <textarea
            value={inputText()}
            rows={1}
            onInput={(event) => handleChangeMessage(event)}
            placeholder={props?.placeholder}
          />
          <label for="">{props?.placeholder}</label>
        </div>
        <div class={clsx(styles.actions, { [styles.visible]: inputText().trim().length > 0 })}>
          <div class={styles.buttons}>
            <Show when={props.cancelButtonText}>
              <Button
                variant="secondary"
                size="M"
                loading={props.loading}
                onClick={() => setInputText('')}
                value={props.cancelButtonText}
              />
            </Show>
            <Show when={props.submitButtonText}>
              <Button
                variant="primary"
                size="M"
                type="submit"
                loading={props.loading}
                value={props.submitButtonText}
              />
            </Show>
          </div>
        </div>
      </div>
      <Show when={props.errorMessage}>
        <div class={styles.error}>{props.errorMessage}</div>
      </Show>
      <Show when={!session()}>
        <div class={styles.loginMessage}>
          <div>
            {t('To write a comment, you must')}&nbsp;
            <a
              class={styles.link}
              href={''}
              onClick={(evt) => {
                evt.preventDefault()
                showModal('auth')
              }}
            >
              {t('sign up or sign in')}
            </a>
          </div>
        </div>
      </Show>
    </form>
  )
}

export default GrowingTextarea
