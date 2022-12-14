import type { JSX } from 'solid-js/jsx-runtime'
import { For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

export const Row3 = (props: { articles: Shout[]; header?: JSX.Element }) => {
  return (
    <div class="floor">
      <div class="wide-container">
        <div class="row">
          <div class="floor-header">{props.header}</div>
          <For each={props.articles}>
            {(a) => (
              <div class="col-md-4">
                <ArticleCard article={a} />
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
