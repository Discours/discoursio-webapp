import type { PopupProps } from '../Popup'

import { clsx } from 'clsx'
import { For, Show, createSignal } from 'solid-js'

import { Popup } from '../Popup'

import popupStyles from '../Popup/Popup.module.scss'
import styles from './DropDown.module.scss'

export type Option = {
  value: string | number
  title: string
}

type Props<TOption> = {
  class?: string
  popupProps?: Partial<PopupProps>
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
          <div class={clsx(styles.trigger, props.triggerCssClass)}>
            {props.currentOption.title}{' '}
            <Chevron
              class={clsx(styles.chevron, {
                [styles.rotate]: isPopupVisible()
              })}
            />
          </div>
        }
        variant="tiny"
        onVisibilityChange={(isVisible) => setIsPopupVisible(isVisible)}
        {...props.popupProps}
      >
        <ul class="nodash">
          <For each={props.options}>
            {(option) => (
              <li>
                <button
                  class={clsx(popupStyles.action, {
                    [styles.active]: props.currentOption.value === option.value
                  })}
                  onClick={() => props.onChange(option)}
                >
                  {option.title}
                </button>
              </li>
            )}
          </For>
        </ul>
      </Popup>
    </Show>
  )
}
