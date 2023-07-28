import styles from './InlineForm.module.scss'
import { Icon } from '../../_shared/Icon'
import { createSignal } from 'solid-js'
import { clsx } from 'clsx'
import { Popover } from '../../_shared/Popover'
import { useLocalize } from '../../../context/localize'

type Props = {
  onClose: () => void
  onClear?: () => void
  onSubmit: (value: string) => void
  validate?: (value: string) => string | Promise<string>
  initialValue?: string
  showInput?: boolean
  placeholder: string
  autoFocus?: boolean
}

export const InlineForm = (props: Props) => {
  const { t } = useLocalize()
  const [formValue, setFormValue] = createSignal(props.initialValue || '')
  const [formValueError, setFormValueError] = createSignal<string | undefined>()

  const handleFormInput = (e) => {
    const value = e.currentTarget.value
    setFormValueError()
    setFormValue(value)
  }

  const handleSaveButtonClick = async () => {
    if (props.validate) {
      const errorMessage = await props.validate(formValue())
      if (errorMessage) {
        setFormValueError(errorMessage)
        return
      }
    }

    props.onSubmit(formValue())
    props.onClose()
  }

  const handleKeyDown = async (e) => {
    setFormValueError('')

    if (e.key === 'Enter') {
      e.preventDefault()
      await handleSaveButtonClick()
    }

    if (e.key === 'Escape' && props.onClear) {
      props.onClear()
    }
  }

  const handleClear = () => {
    props.initialValue ? props.onClear() : props.onClose()
  }

  return (
    <div class={styles.InlineForm}>
      <div class={styles.form}>
        <input
          autofocus={props.autoFocus ?? true}
          type="text"
          value={props.initialValue ?? ''}
          placeholder={props.placeholder}
          onKeyDown={handleKeyDown}
          onInput={handleFormInput}
        />
        <Popover content={t('Add link')}>
          {(triggerRef: (el) => void) => (
            <button
              ref={triggerRef}
              type="button"
              onClick={handleSaveButtonClick}
              disabled={Boolean(formValueError())}
            >
              <Icon name="status-done" />
            </button>
          )}
        </Popover>
        <Popover content={props.initialValue ? t('Remove link') : t('Cancel')}>
          {(triggerRef: (el) => void) => (
            <button ref={triggerRef} type="button" onClick={handleClear}>
              {props.initialValue ? <Icon name="editor-unlink" /> : <Icon name="status-cancel" />}
            </button>
          )}
        </Popover>
      </div>

      <div class={clsx(styles.linkError, { [styles.visible]: Boolean(formValueError()) })}>
        {formValueError()}
      </div>
    </div>
  )
}
