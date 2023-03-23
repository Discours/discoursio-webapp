import { For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

export default (props: { articles: Shout[] }) => (
  <div class="floor floor--7">
    <div class="wide-container">
      <div class="row">
        <For each={props.articles}>
          {(a) => (
            <div class="col-md-12 col-lg-6">
              <ArticleCard
                article={a}
                settings={{
                  additionalClass: 'shout-card--content-top',
                  isWithCover: true,
                  isBigTitle: true,
                  isVertical: true
                }}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  </div>
)
