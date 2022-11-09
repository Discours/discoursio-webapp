import { Show, onMount, createSignal } from 'solid-js'
import { Editor } from '../EditorNew/Editor'

export const CreateView = () => {
  // don't render anything on server
  // usage of isServer causing hydration errors
  const [isMounted, setIsMounted] = createSignal(false)

  onMount(() => setIsMounted(true))

  return (
    <Show when={isMounted()}>
      <Editor />
    </Show>
  )
}

export default CreateView
