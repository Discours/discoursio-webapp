import { createComputed, createSignal, Show } from 'solid-js'
import { For } from 'solid-js/web'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'
const x = [
  ['6', '6'],
  ['4', '8'],
  ['8', '4']
]

export default (props: { articles: Shout[] }) => {
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
                  <ArticleCard
                    article={a}
                    settings={{
                      additionalClass: x[y()][i()] === '8' ? 'shout-card--with-cover' : ''
                    }}
                  />
                </div>
              </Show>
            )
          }}
        </For>
      </div>
    </div>
  )
}
