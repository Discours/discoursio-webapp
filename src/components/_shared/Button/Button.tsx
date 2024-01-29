import type { Accessor, JSX } from 'solid-js'

import { clsx } from 'clsx'

import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'bordered' | 'inline' | 'light' | 'outline' | 'danger'
type Props = {
  value: string | JSX.Element
  size?: 'S' | 'M' | 'L'
  variant?: ButtonVariant
  type?: 'submit' | 'button'
  loading?: boolean
  disabled?: boolean
  onClick?: (event?: MouseEvent) => void
  class?: string
  ref?: Accessor<HTMLButtonElement>
  setRef?: (ref: HTMLButtonElement) => void
  isSubscribeButton?: boolean
}

export const Button = (props: Props) => {
  return (
    <button
      ref={(el) => props.setRef && props.setRef(el)}
      onClick={(ev) => props.onClick(ev)}
      type={props.type ?? 'button'}
      disabled={props.loading || props.disabled}
      class={clsx(
        styles.button,
        styles[props.size ?? 'M'],
        styles[props.variant ?? 'primary'],
        {
          [styles.loading]: props.loading,
          [styles.subscribeButton]: props.isSubscribeButton,
        },
        props.class,
      )}
    >
      {props.value}
    </button>
  )
}
