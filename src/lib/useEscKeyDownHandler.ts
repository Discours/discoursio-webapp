import { onCleanup, onMount } from 'solid-js'

export const useEscKeyDownHandler = (onEscKeyDown: (ev: KeyboardEvent) => void) => {
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscKeyDown(e)
    }
  }

  onMount(() => {
    window.addEventListener('keydown', keydownHandler)

    onCleanup(() => {
      window.removeEventListener('keydown', keydownHandler)
    })
  })
}
