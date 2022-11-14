import type { JSX } from 'solid-js'
import { createSignal, onMount, Show } from 'solid-js'

// show children only on client side
// usage of isServer causing hydration errors
export const ClientContainer = (props: { children: JSX.Element }) => {
  const [isMounted, setIsMounted] = createSignal(false)

  onMount(() => setIsMounted(true))

  return <Show when={isMounted()}>{props.children}</Show>
}
