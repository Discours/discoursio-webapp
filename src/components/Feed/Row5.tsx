import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'
import { getLogger } from '../../utils/logger'

const log = getLogger('Row5')

export const Row5 = (props: { articles: Shout[] }) => {
  return (
    <div class="floor floor--1">
      <div class="wide-container row">
        <div class="col-md-3">
          <ArticleCard article={props.articles[0]} />
          <ArticleCard article={props.articles[1]} settings={{ noimage: true, withBorder: true }} />
        </div>
        <div class="col-md-6">
          <ArticleCard article={props.articles[2]} settings={{ isBigTitle: true }} />
        </div>
        <div class="col-md-3">
          <ArticleCard article={props.articles[3]} />
          <ArticleCard article={props.articles[4]} settings={{ noimage: true, withBorder: true }} />
        </div>
      </div>
    </div>
  )
}
