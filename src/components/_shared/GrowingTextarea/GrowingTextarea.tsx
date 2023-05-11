import { clsx } from 'clsx'
import styles from './GrowingTextarea.module.scss'
import { createSignal } from 'solid-js'

type Props = {
  class?: string
  placeholder: string
  initialValue?: string
  value: (string) => void
}

export const GrowingTextarea = (props: Props) => {
  const [value, setValue] = createSignal('')
  const handleChangeValue = (event) => {
    setValue(event.target.value)
    props.value(event.target.value)
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      return
    }

    if (event.key === 'Enter' && !event.shiftKey && value()?.trim().length > 0) {
      event.preventDefault()
    }
  }

  return (
    <div class={clsx(styles.GrowingTextarea)}>
      <div class={clsx(styles.growWrap, props.class)} data-replicated-value={value()}>
        <textarea
          rows={1}
          autocomplete="off"
          class={clsx(styles.textInput, props.class)}
          value={props.initialValue}
          onKeyDown={handleKeyDown}
          onInput={(event) => handleChangeValue(event)}
          placeholder={props.placeholder}
        />
      </div>
    </div>
  )
}
