import { Show, For, createSignal, createMemo } from 'solid-js'
import '../../styles/Search.scss'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from '../Feed/Card'
import { t } from '../../utils/intl'
import { params } from '../../stores/router'
import { useArticlesStore, loadSearchResults } from '../../stores/zine/articles'
import { useStore } from '@nanostores/solid'

type Props = {
  query: string
  results: Shout[]
}

export const SearchPage = (props: Props) => {
  const args = useStore(params)
  const { getSortedArticles } = useArticlesStore({ sortedArticles: props.results })
  const [getQuery, setQuery] = createSignal(props.query)

  const handleQueryChange = (ev) => {
    setQuery(ev.target.value)
  }

  const handleSubmit = (ev) => {
    // TODO page
    // TODO sort
    loadSearchResults({ query: getQuery() })
  }

  return (
    <div class="search-page wide-container">
      <form action="/search" class="search-form row">
        <div class="col-sm-9">
          {/*FIXME t*/}
          <input type="search" name="q" onChange={handleQueryChange} placeholder="Введите текст..." />
        </div>
        <div class="col-sm-3">
          <button class="button" type="submit" onClick={handleSubmit}>
            {t('Search')}
          </button>
        </div>
      </form>

      <ul class="view-switcher">
        <li class="selected">
          <a href="?by=relevance" onClick={() => (args()['by'] = 'relevance')}>
            {t('By relevance')}
          </a>
        </li>
        <li>
          <a href="?by=rating" onClick={() => (args()['by'] = 'rating')}>
            {t('Top rated')}
          </a>
        </li>
      </ul>

      <Show when={getSortedArticles().length > 0}>
        <h3>{t('Publications')}</h3>

        <div class="floor">
          <div class="row">
            <For each={getSortedArticles()}>
              {(article) => (
                <div class="col-md-3">
                  <ArticleCard article={article} />
                </div>
              )}
            </For>

            <div class="col-md-3">
              <a href="#" class="search__show-more">
                <span class="search__show-more-inner">{t('Load more')}</span>
              </a>
            </div>
          </div>
        </div>

        <h3>{t('Topics')}</h3>

        <h3>{t('Authors')}</h3>
      </Show>
    </div>
  )
}
