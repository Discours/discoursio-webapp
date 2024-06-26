import { onCleanup, onMount } from 'solid-js'

type Options = {
  containerRef?: HTMLElement | null
  handler: (e: MouseEvent & { target: Element }) => void
  // if predicate is present
  // handler is called only if predicate function returns true
  predicate?: (e: MouseEvent & { target: Element }) => boolean
}

export const useOutsideClickHandler = (options: Options) => {
  const { predicate, containerRef, handler } = options
  const handleClickOutside = (ev: MouseEvent & { target: Element }) => {
    if (predicate && !predicate(ev)) {
      return
    }

    if (ev.target === containerRef || containerRef?.contains(ev?.target)) {
      return
    }

    handler(ev)
  }

  onMount(() => {
    // biome-ignore lint/suspicious/noExplicitAny: outside clicker
    document.addEventListener('click', handleClickOutside as (ev: MouseEvent) => any, { capture: true })
    onCleanup(() =>
      // biome-ignore lint/suspicious/noExplicitAny: outside clicker 2
      document.removeEventListener('click', handleClickOutside as (ev: MouseEvent) => any, {
        capture: true
      })
    )
  })
}
