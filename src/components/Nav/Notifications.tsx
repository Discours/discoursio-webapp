import { For, Portal, Show } from 'solid-js/web'
import { useWarningsStore } from '../../stores/ui'
import { createMemo } from 'solid-js'

export default () => {
  const { warnings } = useWarningsStore()

  const notSeen = createMemo(() => warnings().filter((warning) => !warning.seen))

  return (
    <Show when={notSeen().length > 0}>
      <Portal>
        <ul class="warns">
          <For each={warnings()}>{(warning) => <li>{warning.body}</li>}</For>
        </ul>
      </Portal>
    </Show>
  )
}
