import { clsx } from 'clsx'
import { JSX, Show, createEffect, createSignal } from 'solid-js'

import { useOutsideClickHandler } from '~/lib/useOutsideClickHandler'

import styles from './Popup.module.scss'

type HorizontalAnchor = 'center' | 'right'

export type PopupProps = {
  containerCssClass?: string
  popupCssClass?: string
  trigger: JSX.Element
  children: JSX.Element
  onVisibilityChange?: (isVisible: boolean) => void
  horizontalAnchor?: HorizontalAnchor
  variant?: 'tiny'
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

  let containerRef: HTMLElement | undefined
  const closePopup = () => setIsVisible(false)

  useOutsideClickHandler({
    containerRef: containerRef,
    predicate: () => isVisible(),
    handler: () => closePopup()
  })

  createEffect(() => {
    if (props.closePopup) {
      closePopup()
    }
  })

  const toggle = () => setIsVisible((oldVisible) => !oldVisible)
  return (
    <span class={clsx(styles.container, props.containerCssClass)} ref={(el) => (containerRef = el)}>
      <span class={styles.trigger} onClick={toggle}>
        {props.trigger}
      </span>
      <Show when={isVisible()}>
        <div
          class={clsx(styles.popup, props.popupCssClass, {
            [styles.horizontalAnchorCenter]: horizontalAnchor === 'center',
            [styles.horizontalAnchorRight]: horizontalAnchor === 'right',
            [styles.tiny]: props.variant === 'tiny'
          })}
        >
          {props.children}
        </div>
      </Show>
    </span>
  )
}
