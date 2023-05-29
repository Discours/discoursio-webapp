import type { JSX } from 'solid-js'
import { clsx } from 'clsx'
import styles from './Button.module.scss'

type Props = {
  value: string | JSX.Element
  size?: 'S' | 'M' | 'L'
  variant?: 'primary' | 'secondary' | 'bordered' | 'inline' | 'light' | 'outline'
  type?: 'submit' | 'button'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  class?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const Button = (props: Props) => {
  return (
    <button
      ref={(el) => {
        if (typeof props.ref === 'function') {
          props.ref(el)
          return
        }
        props.ref = el
      }}
      onClick={props.onClick}
      type={props.type ?? 'button'}
      disabled={props.loading || props.disabled}
      class={clsx(
        styles.button,
        styles[props.size ?? 'M'],
        styles[props.variant ?? 'primary'],
        {
          [styles.loading]: props.loading
        },
        props.class
      )}
    >
      {props.value}
    </button>
  )
}
