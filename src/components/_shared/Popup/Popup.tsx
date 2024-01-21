import { clsx } from 'clsx'
import { createEffect, createSignal, JSX, Show } from 'solid-js'

import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'

import styles from './Popup.module.scss'

type HorizontalAnchor = 'center' | 'right'

export type PopupProps = {
  containerCssClass?: string
  popupCssClass?: string
  trigger: JSX.Element
  children: JSX.Element
  onVisibilityChange?: (isVisible: boolean) => void
  horizontalAnchor?: HorizontalAnchor
  variant?: 'bordered' | 'tiny'
  closePopup?: boolean
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
  const closePopup = () => setIsVisible(false)

  useOutsideClickHandler({
    containerRef,
    predicate: () => isVisible(),
    handler: () => closePopup(),
  })

  createEffect(() => {
    if (props.closePopup) {
      closePopup()
    }
  })

  const toggle = () => setIsVisible((oldVisible) => !oldVisible)
  return (
    <span class={clsx(styles.container, props.containerCssClass)} ref={(el) => (containerRef.current = el)}>
      <span class={styles.trigger} onClick={toggle}>
        {props.trigger}
      </span>
      <Show when={isVisible()}>
        <div
          class={clsx(styles.popup, props.popupCssClass, {
            [styles.horizontalAnchorCenter]: horizontalAnchor === 'center',
            [styles.horizontalAnchorRight]: horizontalAnchor === 'right',
            [styles.bordered]: props.variant === 'bordered',
            [styles.tiny]: props.variant === 'tiny',
          })}
        >
          {props.children}
        </div>
      </Show>
    </span>
  )
}
