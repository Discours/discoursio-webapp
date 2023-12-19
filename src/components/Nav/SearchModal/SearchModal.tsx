import clsx from 'clsx'
import { createSignal, Show, For } from 'solid-js'

import { ArticleCard } from '../../Feed/ArticleCard'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'

// import { PRERENDERED_ARTICLES_COUNT } from '../../Views/Home'

// import { restoreScrollPosition, saveScrollPosition } from '../../../utils/scroll'

import type { Shout } from '../../../graphql/types.gen'
import { useLocalize } from '../../../context/localize'

import styles from './SearchModal.module.scss'

// @@TODO implement search
// @@TODO implement throttling

// @@TODO implement load more (await ...({ filters: { .. }, limit: .., offset: .. }))
// @@TODO implement modal hiding on article click
// @@TODO search url as const
// @@TODO refactor switcher, filters, topics

const getSearchCoincidences = ({ str, intersection }) =>
  `<span>${str.replace(
    new RegExp(intersection, 'g'),
    `<span class="blackModeIntersection">${intersection}</span>`
  )}</span>`

export const SearchModal = () => {
  const { t } = useLocalize()

  const searchInputRef: { current: HTMLInputElement } = { current: null }

  const [isSearching, setIsSearching] = createSignal(false)
  const [searchResultsList, setSearchResultsList] = createSignal([])
  // const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const handleSearch = async () => {
    const searchValue = searchInputRef.current?.value || ''

    if (Boolean(searchValue)) {
      await fetch(`https://search.discours.io/search?q=${searchValue}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json; charset=utf-8'
        }
      })
        .then((data) => data.json())
        .then((data) => {
          console.log(data)

          // if (data.length) {
          //   const preparedSearchResultsList = [].map((article) => ({
          //     ...article,
          //     title: getSearchCoincidences({
          //       str: article.title,
          //       intersection: searchInputRef.current?.value || ''
          //     }),
          //     subtitle: getSearchCoincidences({
          //       str: article.subtitle,
          //       intersection: searchInputRef.current?.value || ''
          //     })
          //   }))
          //   setSearchResultsList(preparedSearchResultsList)
          // } else {
          //   // @@TODO handle no search results notice
          // }
        })
        .catch((error) => {
          console.log('search request failed', error)
        })
    }
  }

  return (
    <div class={styles.searchContainer}>
      <input
        type="search"
        placeholder={t('Site search')}
        ref={(el) => (searchInputRef.current = el)}
        class={styles.searchInput}
        onInput={handleSearch}
        onFocusIn={() => setIsSearching(true)}
        onFocusOut={() => setIsSearching(false)}
      />

      <Button class={styles.searchButton} onClick={handleSearch} value={<Icon name="search" />} />

      <p
        class={styles.searchDescription}
        innerHTML={t(
          'To find publications, art, comments, authors and topics of interest to you, just start typing your query'
        )}
      />

      {/* @@TODO handle switcher */}
      {/* <ul class={clsx('view-switcher', styles.filterSwitcher)}>
        <li class="view-switcher__item view-switcher__item--selected">
          <button type="button">Все</button>
        </li>
        <li class="view-switcher__item">
          <button type="button">Публикации</button>
        </li>
        <li class="view-switcher__item">
          <button type="button">Темы</button>
        </li>
      </ul> */}

      {/* @@TODO handle filter */}
      {/* <Show when={FILTERS.length}>
        <div class={styles.filterResults}>
          <For each={FILTERS}>
            {(filter) => (
              <button
                type="button"
                class={styles.filterResultsControl}
                onClick={() => setActiveFilter(filter)}
              >
                Период времени
              </button>
            )}
          </For>
        </div>
      </Show> */}

      {/* <Show when={searchResultsList().length}> */}
      <Show when={true}>
        {/* <For each={searchResultsList()}> */}
        <For
          each={[
            {
              body: 'body',
              cover: 'production/image/bbad6b10-9b44-11ee-bdef-5758f9198f7d.png',
              createdAt: '12',
              id: 12,
              slug: '/',
              authors: [
                {
                  id: 1,
                  name: 'author',
                  slug: '/'
                }
              ],
              title: '',
              subtitle: '',
              topics: []
            }
          ]}
        >
          {(article: Shout) => (
            <ArticleCard
              article={article}
              settings={{
                isFloorImportant: true,
                isSingle: true,
                nodate: true
              }}
            />
          )}
        </For>

        {/* @@TODO handle load more */}
        {/* <Show when={isLoadMoreButtonVisible()}>
          <p class="load-more-container">
            <button class="button" onClick={loadMore}>
              {t('Load more')}
            </button>
          </p>
        </Show> */}
      </Show>

      {/* @@TODO handle topics */}
      {/* <div class="container-xl">
        <div class="row">
          <div class={clsx('col-md-18 offset-md-2', styles.topicsList)}>
            {topics.map((topic) => (
              <button type="button" class={styles.topTopic}>
                {topic.name}
              </button>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  )
}
