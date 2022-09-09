import { For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

export default (props: { articles: Shout[] }) => (
  <div class="floor floor--7">
    <div class="wide-container row">
      <For each={props.articles}>
        {(a) => (
          <div class="col-md-6 col-lg-3">
            <ArticleCard
              article={a}
              settings={{ additionalClass: 'shout-card--with-cover shout-card--content-top' }}
            />
          </div>
        )}
      </For>
    </div>
  </div>
)
