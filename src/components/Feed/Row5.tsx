import type { Shout } from '../../graphql/types.gen'

import { ArticleCard } from './ArticleCard'

export const Row5 = (props: { articles: Shout[]; nodate?: boolean }) => {
  return (
    <div class="floor floor--1">
      <div class="wide-container">
        <div class="row">
          <div class="col-md-6">
            <ArticleCard article={props.articles[0]} settings={{ nodate: props.nodate }} />
            <ArticleCard
              article={props.articles[1]}
              settings={{ noimage: true, withBorder: true, nodate: props.nodate }}
            />
          </div>
          <div class="col-md-12">
            <ArticleCard
              article={props.articles[2]}
              settings={{ isBigTitle: true, nodate: props.nodate }}
            />
          </div>
          <div class="col-md-6">
            <ArticleCard article={props.articles[3]} settings={{ nodate: props.nodate }} />
            <ArticleCard
              article={props.articles[4]}
              settings={{ noimage: true, withBorder: true, nodate: props.nodate }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
