import type { JSX } from 'solid-js'

import { Show, createSignal, onMount } from 'solid-js'

const [isClient, setIsClient] = createSignal(false)

// show children only on client side
// usage of isServer causing hydration errors
export const ShowOnlyOnClient = (props: { children: JSX.Element }) => {
  onMount(() => setIsClient(true))

  return <Show when={isClient()}>{props.children}</Show>
}
