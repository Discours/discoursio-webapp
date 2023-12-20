import type { PopupProps } from '../Popup'

import { clsx } from 'clsx'
import { createSignal, For, Show } from 'solid-js'

import { Popup } from '../Popup'

import styles from './DropDown.module.scss'

export type Option = {
  value: string | number
  title: string
}

type Props<TOption> = {
  class?: string
  popupProps?: PopupProps
  options: TOption[]
  currentOption: TOption
  triggerCssClass?: string
  onChange: (option: TOption) => void
}

const Chevron = (props: { class?: string }) => {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path d="M13.5 6L9 12L4.5 6H13.5Z" fill="#141414" />
    </svg>
  )
}

export const DropDown = <TOption extends Option = Option>(props: Props<TOption>) => {
  const [isPopupVisible, setIsPopupVisible] = createSignal(false)

  return (
    <Show when={props.currentOption} keyed={true}>
      <Popup
        trigger={
          <div class={props.triggerCssClass}>
            {props.currentOption.title}{' '}
            <Chevron
              class={clsx(styles.chevron, {
                [styles.rotate]: isPopupVisible(),
              })}
            />
          </div>
        }
        variant="tiny"
        onVisibilityChange={(isVisible) => setIsPopupVisible(isVisible)}
        {...props.popupProps}
      >
        <For each={props.options.filter((p) => p.value !== props.currentOption.value)}>
          {(option) => (
            <div class="link" onClick={() => props.onChange(option)}>
              {option.title}
            </div>
          )}
        </For>
      </Popup>
    </Show>
  )
}
