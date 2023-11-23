import { clsx } from 'clsx'
import { createEffect, createSignal, Show } from 'solid-js'

import { ShowOnlyOnClient } from '../ShowOnlyOnClient'

import styles from './GrowingTextarea.module.scss'

type Props = {
  class?: string
  placeholder: string
  initialValue?: string
  value: (string) => void
  maxLength?: number
  allowEnterKey: boolean
  variant?: 'bordered'
  fieldName?: string
  textAreaRef?: (el: HTMLTextAreaElement) => void
}

const GrowingTextarea = (props: Props) => {
  const [value, setValue] = createSignal<string>('')
  const [isFocused, setIsFocused] = createSignal(false)

  createEffect(() => {
    if (props.maxLength && props.initialValue?.length > props.maxLength) {
      setValue(props.initialValue?.slice(0, props.maxLength))
    } else {
      setValue(props.initialValue ?? '')
    }
  })
  const handleChangeValue = (textareaValue) => {
    setValue(textareaValue)
    props.value(textareaValue)
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
    <ShowOnlyOnClient>
      <div
        class={clsx(styles.GrowingTextarea, {
          [styles.bordered]: props.variant === 'bordered',
          [styles.hasFieldName]: props.fieldName && value().length > 0,
        })}
      >
        <Show when={props.fieldName && value().length > 0}>
          <div class={styles.fieldName}>{props.fieldName}</div>
        </Show>
        <div class={clsx(styles.growWrap, props.class)} data-replicated-value={value()}>
          <textarea
            ref={props.textAreaRef}
            rows={1}
            maxlength={props.maxLength}
            autocomplete="off"
            class={clsx(styles.textInput, props.class)}
            value={
              props.initialValue && props.maxLength
                ? props.initialValue?.slice(0, props.maxLength)
                : props.initialValue
            }
            onKeyDown={props.allowEnterKey ? handleKeyDown : null}
            onInput={(event) => handleChangeValue(event.target.value)}
            placeholder={props.placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
        <Show when={(props.maxLength && value() && isFocused()) || props.variant === 'bordered'}>
          <div
            class={clsx(styles.maxLength, {
              [styles.visible]: isFocused(),
              [styles.limited]: value().length === props.maxLength,
            })}
          >
            <Show when={props.variant === 'bordered'} fallback={`${value().length} / ${props.maxLength}`}>
              {`${props.maxLength - value().length}`}
            </Show>
          </div>
        </Show>
      </div>
    </ShowOnlyOnClient>
  )
}

export default GrowingTextarea // for async load
