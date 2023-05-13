import { createEffect, createSignal, JSX, JSXElement, Show } from 'solid-js'
import usePopper from 'solid-popper'
import styles from './Popover.module.scss'

type Props = {
  children: (setTooltipEl: (el: HTMLElement | null) => void) => JSX.Element
  content: string
}

export const Popover = (props: Props) => {
  const [show, setShow] = createSignal(false)
  const [anchor, setAnchor] = createSignal<HTMLElement>()
  const [popper, setPopper] = createSignal<HTMLElement>()

  usePopper(anchor, popper, {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: 20
        }
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top', 'bottom']
        }
      }
    ]
  })

  const showEvents = ['mouseenter', 'focus']
  const hideEvents = ['mouseleave', 'blur']

  createEffect(() => {
    showEvents.forEach((event) => {
      anchor() && anchor().addEventListener(event, () => setShow(true))
    })
    hideEvents.forEach((event) => {
      anchor() && anchor().addEventListener(event, () => setShow(false))
    })
  })

  return (
    <>
      {props.children(setAnchor)}
      <Show when={show()}>
        <div ref={setPopper} class={styles.tooltip} role="tooltip">
          {props.content}
          <div class={styles.arrow} data-popper-arrow={true} />
        </div>
      </Show>
    </>
  )
}
