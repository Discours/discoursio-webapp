import { JSX, createSignal } from 'solid-js'

import { clsx } from 'clsx'

import styles from './Button.module.scss'

export type ButtonVariant =
  | 'primary'
  | 'primary-disabled'
  | 'secondary'
  | 'secondary-disabled'
  | 'bordered'
  | 'outline'
  | 'primary-square'
  | 'secondary-square'
  | 'disabled'
  | 'loading'
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
  const [loading, setLoading] = createSignal<boolean>(Boolean(props.loading))

  const handleClick = (event: MouseEvent) => {
    if (loading() || props.loading) return
    setLoading(true)

    props.onClick?.(event)

    setLoading(false)
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

  const isLoading = loading()

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
      disabled={isLoading || props.disabled}
      class={clsx(
        styles.button,
        styles[props.size ?? 'M'],
        styles[(props.variant ?? 'primary') as keyof typeof styles],
        {
          [styles.disabled]: props.disabled,
          [styles.loadingDots]: isLoading

          // [styles.subscribeButton]: props.isSubscribeButton
        },
        props.class
      )}
    >
      {isLoading ? <LoadingDots /> : props.value}
      {/*{props.value}*/}
    </button>
  )
}
