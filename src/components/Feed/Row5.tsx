import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

export const Row5 = (props: { articles: Shout[] }) => {
  return (
    <div class="floor floor--1">
      <div class="wide-container row">
        <div class="col-md-3">
          <ArticleCard article={props.articles[0]} />
          <ArticleCard article={props.articles[1]} />
        </div>
        <div class="col-md-6">
          <ArticleCard article={props.articles[2]} />
        </div>
        <div class="col-md-3">
          <ArticleCard article={props.articles[3]} />
          <ArticleCard article={props.articles[4]} />
        </div>
      </div>
    </div>
  )
}
