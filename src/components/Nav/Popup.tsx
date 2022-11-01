import { createEffect, createSignal, JSX, onCleanup, onMount, Show } from 'solid-js'
import styles from './Popup.module.scss'
import { clsx } from 'clsx'

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

  let container: HTMLDivElement | undefined

  const handleClickOutside = (event: MouseEvent & { target: Element }) => {
    if (!isVisible()) {
      return
    }

    if (event.target === container || container?.contains(event.target)) {
      return
    }

    setIsVisible(false)
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, { capture: true })
    onCleanup(() => document.removeEventListener('click', handleClickOutside, { capture: true }))
  })

  const toggle = () => setIsVisible((oldVisible) => !oldVisible)

  return (
    <span class={clsx(styles.container, props.containerCssClass)} ref={container}>
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
