import { JSX, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { createTooltip } from '~/lib/createTooltip'

import styles from './Popover.module.scss'

type Props = {
  children: (setTooltipEl: (el: HTMLElement | null) => void) => JSX.Element
  content: string | JSX.Element
  disabled?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right'
  offset?: [number, number]
}

export const Popover = (props: Props) => {
  const [show, setShow] = createSignal(false)
  const [anchor, setAnchor] = createSignal<HTMLElement>()
  const [tooltip, setTooltip] = createSignal<HTMLElement>()

  let tooltipInstance: ReturnType<typeof createTooltip> | undefined

  onMount(() => {
    const anchorEl = anchor()
    const tooltipEl = tooltip()

    if (anchorEl && tooltipEl && !props.disabled) {
      tooltipInstance = createTooltip(anchorEl, tooltipEl, {
        placement: props.placement || 'top',
        offset: props.offset || [0, 8]
      })
    }
  })

  onCleanup(() => {
    tooltipInstance?.destroy()
  })

  const handleMouseOver = () => {
    if (!props.disabled) {
      setShow(true)
      tooltipInstance?.update()
    }
  }

  const handleMouseOut = () => {
    setShow(false)
  }

  return (
    <>
      <div
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
        onFocusIn={handleMouseOver}
        onFocusOut={handleMouseOut}
      >
        {props.children(setAnchor)}
      </div>
      <Show when={show() && !props.disabled}>
        <div ref={setTooltip} class={styles.tooltip}>
          {props.content}
          <div class={styles.arrow} />
        </div>
      </Show>
    </>
  )
}
