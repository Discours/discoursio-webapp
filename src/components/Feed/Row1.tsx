import { Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

export const Row1 = (props: { article: Shout }) => (
  <Show when={!!props.article}>
    <div class="floor floor--one-article">
      <div class="wide-container">
        <div class="row">
          <div class="col-12">
            <ArticleCard article={props.article} settings={{ isSingle: true }} />
          </div>
        </div>
      </div>
    </div>
  </Show>
)
