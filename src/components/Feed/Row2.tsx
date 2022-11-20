import { createComputed, createSignal, Show, For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

const x = [
  ['6', '6'],
  ['4', '8'],
  ['8', '4']
]

export const Row2 = (props: { articles: Shout[]; isEqual?: boolean }) => {
  const [y, setY] = createSignal(0)

  createComputed(() => setY(Math.floor(Math.random() * x.length)))

  return (
    <div class="floor">
      <div class="wide-container">
        <div class="row">
          <For each={props.articles}>
            {(a, i) => {
              return (
                <Show when={!!a}>
                  <div class={`col-md-${props.isEqual ? '6' : x[y()][i()]}`}>
                    <ArticleCard
                      article={a}
                      settings={{
                        isWithCover: props.isEqual || x[y()][i()] === '8',
                        nodate: props.isEqual
                      }}
                    />
                  </div>
                </Show>
              )
            }}
          </For>
        </div>
      </div>
    </div>
  )
}
