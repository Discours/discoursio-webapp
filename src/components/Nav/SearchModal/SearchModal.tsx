import clsx from 'clsx'
import { createSignal, Show, For } from 'solid-js'

import { ArticleCard } from '../../Feed/ArticleCard'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'

import type { Shout } from '../../../graphql/types.gen'

import { searchUrl } from '../../../utils/config'

import { useLocalize } from '../../../context/localize'

import styles from './SearchModal.module.scss'

// @@TODO handle founded shouts rendering (cors)
// @@TODO implement load more (await ...({ filters: { .. }, limit: .., offset: .. }))

const getSearchCoincidences = ({ str, intersection }) =>
  `<span>${str.replace(
    new RegExp(intersection, 'g'),
    `<span class="blackModeIntersection">${intersection}</span>`
  )}</span>`

export const SearchModal = () => {
  const { t } = useLocalize()

  const searchInputRef: { current: HTMLInputElement } = { current: null }

  const [searchResultsList, setSearchResultsList] = createSignal<[] | null>([])
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)

  const handleSearch = async () => {
    const searchValue = searchInputRef.current?.value || ''

    if (Boolean(searchValue)) {
      setIsLoading(true)

      await fetch(`${searchUrl}=${searchValue}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json; charset=utf-8'
        }
      })
        .then((data) => data.json())
        .then((data) => {
          // if (data.what) {
          //   const preparedSearchResultsList = data.what.map((article) => ({
          //     ...article,
          //     title: getSearchCoincidences({
          //       str: article.title,
          //       intersection: searchInputRef.current?.value || ''
          //     }),
          //     subtitle: getSearchCoincidences({
          //       str: article.subtitle,
          //       intersection: searchInputRef.current?.value || ''
          //     }),
          //   }))
          //
          //   setSearchResultsList(preparedSearchResultsList)
          //
          //   @@TODO handle setIsLoadMoreButtonVisible()
          // } else {
          //   setSearchResultsList(null)
          // }
        })
        .catch((error) => {
          console.log('search request failed', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const loadMore = () => {}

  return (
    <div class={styles.searchContainer}>
      <input
        type="search"
        placeholder={t('Site search')}
        ref={(el) => (searchInputRef.current = el)}
        class={styles.searchInput}
        onInput={handleSearch}
      />

      <Button
        class={styles.searchButton}
        onClick={handleSearch}
        value={isLoading() ? <div class={styles.searchLoader} /> : <Icon name="search" />}
      />

      <p
        class={styles.searchDescription}
        innerHTML={t(
          'To find publications, art, comments, authors and topics of interest to you, just start typing your query'
        )}
      />

      {/* <Show when={!isLoading()}> */}
      <Show when={false}>
        <Show when={searchResultsList().length}>
          {/* <For each={searchResultsList()}> */}
          <For
            each={[
              {
                body: 'body',
                cover: 'production/image/bbad6b10-9b44-11ee-bdef-5758f9198f7d.png',
                createdAt: '12',
                id: 12,
                slug: '/about',
                authors: [
                  {
                    id: 1,
                    name: 'author',
                    slug: '/'
                  }
                ],
                title: 'asas',
                subtitle: 'asas',
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

          <Show when={isLoadMoreButtonVisible()}>
            <p class="load-more-container">
              <button class="button" onClick={loadMore}>
                {t('Load more')}
              </button>
            </p>
          </Show>
        </Show>

        <Show when={!searchResultsList()}>
          <p class={styles.searchDescription} innerHTML={t("We couldn't find anything for your request")} />
        </Show>
      </Show>

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
                {filter.name}
              </button>
            )}
          </For>
        </div>
      </Show> */}

      {/* @@TODO handle topics */}
      {/* <Show when={TOPICS.length}>
        <div class="container-xl">
          <div class="row">
            <div class={clsx('col-md-18 offset-md-2', styles.topicsList)}>
              <For each={TOPICS}>
                {(topic) => (
                  <button type="button" class={styles.topTopic} onClick={() => setActiveTopic(topic)}>
                    {topic.name}
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show> */}
    </div>
  )
}
