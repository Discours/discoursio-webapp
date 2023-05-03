import { onCleanup, onMount } from 'solid-js'

type Options = {
  containerRef: { current: HTMLElement }
  handler: () => void
  // if predicate is present
  // handler is called only if predicate function returns true
  predicate?: () => boolean
}

export const useOutsideClickHandler = (options: Options) => {
  const { predicate, containerRef, handler } = options
  const handleClickOutside = (event: MouseEvent & { target: Element }) => {
    if (predicate && !predicate()) {
      return
    }

    if (event.target === containerRef.current || containerRef.current?.contains(event.target)) {
      return
    }

    handler()
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, { capture: true })
    onCleanup(() => document.removeEventListener('click', handleClickOutside, { capture: true }))
  })
}
