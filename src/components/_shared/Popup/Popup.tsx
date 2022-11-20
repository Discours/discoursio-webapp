import { createEffect, createSignal, JSX, Show } from 'solid-js'
import styles from './Popup.module.scss'
import { clsx } from 'clsx'
import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'

type HorizontalAnchor = 'center' | 'right'

export type PopupProps = {
  containerCssClass?: string
  trigger: JSX.Element
  children: JSX.Element
  onVisibilityChange?: (isVisible) => void
  horizontalAnchor?: HorizontalAnchor
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

  const toggle = () => setIsVisible((oldVisible) => !oldVisible)

  return (
    <span class={clsx(styles.container, props.containerCssClass)} ref={(el) => (containerRef.current = el)}>
      <span onClick={toggle}>{props.trigger}</span>
      <Show when={isVisible()}>
        <div
          class={clsx(styles.popup, {
            [styles.horizontalAnchorCenter]: horizontalAnchor === 'center',
            [styles.horizontalAnchorRight]: horizontalAnchor === 'right'
          })}
        >
          {props.children}
        </div>
      </Show>
    </span>
  )
}
