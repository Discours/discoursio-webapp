import styles from './InlineForm.module.scss'
import { Icon } from '../../_shared/Icon'
import { createSignal, Show } from 'solid-js'
import { useLocalize } from '../../../context/localize'
import { clsx } from 'clsx'

type Props = {
  onClose: () => void
  onClear?: () => void
  onSubmit: (value: string) => void
  variant: 'inBubble' | 'inFloating'
  validate?: (value: string) => string | Promise<string>
  initialValue?: string
}

export const InlineForm = (props: Props) => {
  const { t } = useLocalize()
  const [formValue, setFormValue] = createSignal(props.initialValue || '')
  const [formValueError, setFormValueError] = createSignal('')

  const handleFormInput = (value) => {
    setFormValue(value)
  }

  const handleSaveButtonClick = async () => {
    const errorMessage = await props.validate(formValue())
    if (errorMessage) {
      setFormValueError(errorMessage)
      return
    }
    props.onSubmit(formValue())
    props.onClose()
  }

  const handleKeyPress = async (event) => {
    setFormValueError('')
    const key = event.key

    if (key === 'Enter') {
      await handleSaveButtonClick()
    }

    if (key === 'Esc') {
      props.onClear
    }
  }

  return (
    <div
      class={clsx(styles.InlineForm, {
        // [styles.inBubble]: props.variant === 'inBubble',
        [styles.inFloating]: props.variant === 'inFloating'
      })}
    >
      <div class={styles.form}>
        <Show when={props.variant === 'inBubble'}>
          <input
            type="text"
            placeholder={t('Enter URL address')}
            autofocus
            value={props.initialValue}
            onKeyPress={(e) => handleKeyPress(e)}
            onInput={(e) => handleFormInput(e.currentTarget.value)}
          />
        </Show>
        <Show when={props.variant === 'inFloating'}>
          <input
            autofocus
            type="text"
            placeholder={t('Paste Embed code')}
            onKeyPress={(e) => handleKeyPress(e)}
            onInput={(e) => handleFormInput(e.currentTarget.value)}
          />
        </Show>
        <button type="button" onClick={handleSaveButtonClick} disabled={formValueError() !== ''}>
          <Icon name="status-done" />
        </button>
        <button type="button" onClick={props.onClear}>
          {props.initialValue ? <Icon name="editor-unlink" /> : <Icon name="status-cancel" />}
        </button>
      </div>

      <div class={clsx(styles.linkError, { [styles.visible]: Boolean(formValueError()) })}>
        {formValueError()}
      </div>
    </div>
  )
}
