import type { Shout } from '../../graphql/schema/core.gen'

import { For } from 'solid-js'

import { ArticleCard } from './ArticleCard'

export default (props: { articles: Shout[] }) => (
  <div class="floor floor--7">
    <div class="wide-container">
      <div class="short-cards">
        <For each={props.articles}>
          {(a) => (
            <div class="short-card">
              <ArticleCard
                article={a}
                settings={{
                  additionalClass: 'shout-card--content-top',
                  isWithCover: true,
                  isBigTitle: true,
                  isVertical: true,
                  nodate: true
                }}
                desktopCoverSize="S"
              />
            </div>
          )}
        </For>
      </div>
    </div>
  </div>
)
