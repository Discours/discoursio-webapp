import {createSignal, JSX} from 'solid-js'

import { clsx } from 'clsx'

import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'primary-disabled' | 'secondary' | 'secondary-disabled' | 'bordered' |
                            'outline' | 'primary-square' |
                            'secondary-square' | 'primary-disabled-square' | 'secondary-disabled-square'
type Props = {
  title?: string
  value: string | JSX.Element
  size?: 'S' | 'M' | 'L' | 'M-square' | 'S-square' | 'XS-square'
  variant?: ButtonVariant
  type?: 'submit' | 'button'
  loading?: boolean
  disabled?: boolean
  onClick?: (event?: MouseEvent) => void
  class?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
  isSubscribeButton?: boolean
}

export const Button = (props: Props) => {
  const [loading, setLoading] = createSignal(props.loading || false);
  const handleClick = (event: MouseEvent) => {
    if (loading() || props.loading) return;
    setLoading(true);

    props.onClick?.(event);

    setLoading(false);
  }

  const LoadingDots = () => {
    return (
      <div class={styles.loadingDots}>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    )
  }

  return (
    <button
      ref={(el) => {
        if (typeof props.ref === 'function') {
          props.ref(el)
          return
        }
        props.ref = el
      }}
      title={props.title || (typeof props.value === 'string' ? props.value : '')}
      onClick={handleClick}
      type={props.type ?? 'button'}
      disabled={props.disabled}
      class={clsx(
        styles.button,
        styles[props.size ?? 'M'],
        styles[props.variant ?? 'primary'],
        {
          [styles['primary-disabled']]: props.disabled && props.variant === 'primary',
          [styles['secondary-disabled']]: props.disabled && props.variant === 'secondary',
          [styles['primary-disabled-square']]: props.disabled && props.variant === 'primary-disabled-square',
          [styles['secondary-disabled-square']]: props.disabled && props.variant === 'secondary-disabled-square'

          // [styles.subscribeButton]: props.isSubscribeButton
        },
        props.class
      )}
    >
      {loading() ? <LoadingDots /> : props.value}
      {/*{props.value}*/}
    </button>
  )
}

