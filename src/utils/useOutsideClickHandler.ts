import { onCleanup, onMount } from 'solid-js'

type Options = {
  containerRef: { current: HTMLElement }
  handler: (e: MouseEvent & { target: Element }) => void
  // if predicate is present
  // handler is called only if predicate function returns true
  predicate?: (e: MouseEvent & { target: Element }) => boolean
}

export const useOutsideClickHandler = (options: Options) => {
  const { predicate, containerRef, handler } = options
  const handleClickOutside = (e: MouseEvent & { target: Element }) => {
    if (predicate && !predicate(e)) {
      return
    }

    if (e.target === containerRef.current || containerRef.current?.contains(e.target)) {
      return
    }

    handler(e)
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, { capture: true })
    onCleanup(() => document.removeEventListener('click', handleClickOutside, { capture: true }))
  })
}
