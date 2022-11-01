import { createComputed, createSignal, Show, For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

const x = [
  ['6', '6'],
  ['4', '8'],
  ['8', '4']
]

export const Row2 = (props: { articles: Shout[] }) => {
  const [y, setY] = createSignal(0)

  createComputed(() => setY(Math.floor(Math.random() * x.length)))

  return (
    <div class="floor">
      <div class="wide-container row">
        <For each={props.articles}>
          {(a, i) => {
            return (
              <Show when={!!a}>
                <div class={`col-md-${x[y()][i()]}`}>
                  <ArticleCard article={a} settings={{ isWithCover: x[y()][i()] === '8' }} />
                </div>
              </Show>
            )
          }}
        </For>
      </div>
    </div>
  )
}
