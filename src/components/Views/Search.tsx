import { Show, For, createSignal } from 'solid-js'
import '../../styles/Search.scss'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from '../Feed/Card'

import { loadShouts, useArticlesStore } from '../../stores/zine/articles'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { useRouter } from '../../stores/router'
import { useLocalize } from '../../context/localize'

type SearchPageSearchParams = {
  by: '' | 'relevance' | 'rating'
}

type Props = {
  query: string
  results: Shout[]
}

const LOAD_MORE_PAGE_SIZE = 50

export const SearchView = (props: Props) => {
  const { t } = useLocalize()
  const { sortedArticles } = useArticlesStore({ shouts: props.results })
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [query, setQuery] = createSignal(props.query)
  const [offset, setOffset] = createSignal(0)

  const { searchParams, handleClientRouteLinkClick } = useRouter<SearchPageSearchParams>()
  let searchEl: HTMLInputElement
  const handleQueryChange = (_ev) => {
    setQuery(searchEl.value)
  }

  const loadMore = async () => {
    saveScrollPosition()
    const { hasMore } = await loadShouts({
      filters: {
        title: query(),
        body: query()
      },
      offset: offset(),
      limit: LOAD_MORE_PAGE_SIZE
    })
    setIsLoadMoreButtonVisible(hasMore)
    setOffset(offset() + LOAD_MORE_PAGE_SIZE)
    restoreScrollPosition()
  }

  return (
    <div class="search-page wide-container">
      <form action="/search" class="search-form row">
        <div class="col-sm-18">
          <input
            type="search"
            name="q"
            ref={searchEl}
            onInput={handleQueryChange}
            placeholder={t('Enter text') + '...'}
          />
        </div>
        <div class="col-sm-6">
          <button class="button" type="submit" onClick={loadMore}>
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
          <a href="?by=relevance" onClick={handleClientRouteLinkClick}>
            {t('By relevance')}
          </a>
        </li>
        <li
          classList={{
            selected: searchParams().by === 'rating'
          }}
        >
          <a href="?by=rating" onClick={handleClientRouteLinkClick}>
            {t('Top rated')}
          </a>
        </li>
      </ul>

      <Show when={sortedArticles().length > 0}>
        <h3>{t('Publications')}</h3>

        <div class="floor">
          <div class="row">
            <For each={sortedArticles()}>
              {(article) => (
                <div class="col-md-6">
                  <ArticleCard article={article} />
                </div>
              )}
            </For>

            <div class="col-md-6">
              <a href="#" class="search__show-more">
                <span class="search__show-more-inner">{t('Load more')}</span>
              </a>
            </div>
          </div>
        </div>

        <Show when={isLoadMoreButtonVisible()}>
          <p class="load-more-container">
            <button class="button" onClick={loadMore}>
              {t('Load more')}
            </button>
          </p>
        </Show>
      </Show>
    </div>
  )
}
