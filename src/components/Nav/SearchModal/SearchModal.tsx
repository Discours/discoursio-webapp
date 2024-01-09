import { createSignal, Show, For } from 'solid-js'

import { ArticleCard } from '../../Feed/ArticleCard'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'

import type { Shout } from '../../../graphql/types.gen'

import { searchUrl } from '../../../utils/config'

import { useLocalize } from '../../../context/localize'
import { hideModal } from '../../../stores/ui'

import styles from './SearchModal.module.scss'

// @@TODO handle empty article options after backend support (subtitle, cover, etc.)
// @@TODO implement load more
// @@TODO implement FILTERS & TOPICS

const getSearchCoincidences = ({ str, intersection }: { str: string; intersection: string }) =>
  `<span>${str.replace(
    new RegExp(intersection, 'gi'),
    (casePreservedMatch) => `<span class="blackModeIntersection">${casePreservedMatch}</span>`
  )}</span>`

export const SearchModal = () => {
  const { t } = useLocalize()

  const searchInputRef: { current: HTMLInputElement } = { current: null }

  const [searchResultsList, setSearchResultsList] = createSignal<[] | null>([])
  const [isLoading, setIsLoading] = createSignal(false)
  // const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

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
          if (data.length) {
            const preparedSearchResultsList = data.map((article, index) => ({
              ...article,
              body: '',
              cover: '',
              createdAt: '',
              id: index,
              slug: article.slug,
              authors: [],
              topics: [],
              title: article.title
                ? getSearchCoincidences({
                    str: article.title,
                    intersection: searchInputRef.current?.value || ''
                  })
                : '',
              subtitle: article.subtitle
                ? getSearchCoincidences({
                    str: article.subtitle,
                    intersection: searchInputRef.current?.value || ''
                  })
                : ''
            }))

            setSearchResultsList(preparedSearchResultsList)
          } else {
            setSearchResultsList(null)
          }
        })
        .catch((error) => {
          console.log('search request failed', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const handleArticleClick = () => {
    hideModal()
  }

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

      <Show when={!isLoading()}>
        <Show when={searchResultsList()}>
          <For each={searchResultsList()}>
            {(article: Shout) => (
              <div onClick={handleArticleClick}>
                <ArticleCard
                  article={article}
                  settings={{
                    noimage: true, // @@TODO remove flag after cover support
                    isFloorImportant: true,
                    isSingle: true,
                    nodate: true
                  }}
                />
              </div>
            )}
          </For>

          {/* <Show when={isLoadMoreButtonVisible()}>
            <p class="load-more-container">
              <button class="button" onClick={loadMore}>
                {t('Load more')}
              </button>
            </p>
          </Show> */}
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
