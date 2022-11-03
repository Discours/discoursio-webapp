import { onCleanup, onMount } from 'solid-js'

export const useEscKeyDownHandler = (onEscKeyDown: () => void) => {
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onEscKeyDown()
  }

  onMount(() => {
    window.addEventListener('keydown', keydownHandler)

    onCleanup(() => {
      window.removeEventListener('keydown', keydownHandler)
    })
  })
}
