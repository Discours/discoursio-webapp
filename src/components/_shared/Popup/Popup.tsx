import { createEffect, createSignal, JSX, Show } from 'solid-js'
import styles from './Popup.module.scss'
import { clsx } from 'clsx'
import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'
import { set } from 'husky'

type HorizontalAnchor = 'center' | 'right'

export type PopupProps = {
  containerCssClass?: string
  trigger: JSX.Element
  children: JSX.Element
  onVisibilityChange?: (isVisible) => void
  horizontalAnchor?: HorizontalAnchor
  variant?: 'bordered' | 'tiny'
  forceHide?: boolean
}

export const Popup = (props: PopupProps) => {
  const [isVisible, setIsVisible] = createSignal(false)
  const horizontalAnchor: HorizontalAnchor = props.horizontalAnchor || 'center'

  createEffect(() => {
    if (props.onVisibilityChange) {
      props.onVisibilityChange(isVisible())
    }
  })

  const containerRef: { current: HTMLElement } = { current: null }

  useOutsideClickHandler({
    containerRef,
    predicate: () => isVisible(),
    handler: () => setIsVisible(false)
  })

  createEffect(() => {
    if (props.forceHide) setIsVisible(false)
  })
  const toggle = () => setIsVisible((oldVisible) => !oldVisible)

  return (
    <span class={clsx(styles.container, props.containerCssClass)} ref={(el) => (containerRef.current = el)}>
      <span onClick={toggle}>{props.trigger}</span>
      <Show when={isVisible()}>
        <div
          class={clsx(styles.popup, {
            [styles.horizontalAnchorCenter]: horizontalAnchor === 'center',
            [styles.horizontalAnchorRight]: horizontalAnchor === 'right',
            [styles.bordered]: props.variant === 'bordered',
            [styles.tiny]: props.variant === 'tiny'
          })}
        >
          {props.children}
        </div>
      </Show>
    </span>
  )
}
