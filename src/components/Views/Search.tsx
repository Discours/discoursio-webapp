import { Show, For, createSignal } from 'solid-js'
import '../../styles/Search.scss'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from '../Feed/Card'
import { t } from '../../utils/intl'
import { useArticlesStore, loadShoutsBy } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'

type SearchPageSearchParams = {
  by: '' | 'relevance' | 'rating'
}

type Props = {
  query: string
  results: Shout[]
}

export const SearchView = (props: Props) => {
  const { sortedArticles } = useArticlesStore({ shouts: props.results })
  const [getQuery, setQuery] = createSignal(props.query)

  const { searchParams, handleClientRouteLinkClick } = useRouter<SearchPageSearchParams>()

  const handleQueryChange = (ev) => {
    setQuery(ev.target.value)
  }

  const handleSubmit = (_ev) => {
    // TODO page
    // TODO sort
    loadShoutsBy({ by: { title: getQuery(), body: getQuery() }, limit: 50 })
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
        <li
          classList={{
            selected: searchParams().by === 'relevance'
          }}
        >
          <a href="?by=relevance">{t('By relevance')}</a>
        </li>
        <li
          classList={{
            selected: searchParams().by === 'rating'
          }}
        >
          <a href="?by=rating">{t('Top rated')}</a>
        </li>
      </ul>

      <Show when={sortedArticles().length > 0}>
        <h3>{t('Publications')}</h3>

        <div class="floor">
          <div class="row">
            <For each={sortedArticles()}>
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
