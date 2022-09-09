import { For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './Card'

export default (props: { articles: Shout[] }) => (
  <div class="floor floor--1">
    <div class="wide-container row">
      <div class="col-md-3">
        <For each={props.articles.slice(0, 2)}>{(a) => <ArticleCard article={a} />}</For>
      </div>
      <div class="col-md-6">
        <For each={props.articles.slice(2, 3)}>{(a) => <ArticleCard article={a} />}</For>
      </div>
      <div class="col-md-3">
        <For each={props.articles.slice(3, 5)}>{(a) => <ArticleCard article={a} />}</For>
      </div>
    </div>
  </div>
)
