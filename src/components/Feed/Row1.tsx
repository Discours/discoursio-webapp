import { Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './ArticleCard'

export const Row1 = (props: {
  article: Shout
  nodate?: boolean
  noAuthorLink?: boolean
  noauthor?: boolean
}) => (
  <Show when={!!props.article}>
    <div class="floor floor--one-article">
      <div class="wide-container">
        <div class="row">
          <div class="col-24">
            <ArticleCard
              article={props.article}
              settings={{
                isSingle: true,
                nodate: props.nodate,
                noAuthorLink: props.noAuthorLink,
                noauthor: props.noauthor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </Show>
)
