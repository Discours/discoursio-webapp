import type { Shout } from '../../../graphql/schema/core.gen'

import { createResource, createSignal, For, onCleanup, Show } from 'solid-js'
import { debounce } from 'throttle-debounce'

import { useLocalize } from '../../../context/localize'
import { loadShoutsSearch } from '../../../stores/zine/articles'
import { restoreScrollPosition, saveScrollPosition } from '../../../utils/scroll'
import { byScore } from '../../../utils/sortby'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { FEED_PAGE_SIZE } from '../../Views/Feed/Feed'

import { SearchResultItem } from './SearchResultItem'

import styles from './SearchModal.module.scss'

// @@TODO handle empty article options after backend support (subtitle, cover, etc.)
// @@TODO implement load more
// @@TODO implement FILTERS & TOPICS
// @@TODO use save/restoreScrollPosition if needed

const getSearchCoincidences = ({ str, intersection }: { str: string; intersection: string }) =>
  `<span>${str.replaceAll(
    new RegExp(intersection, 'gi'),
    (casePreservedMatch) => `<span class="blackModeIntersection">${casePreservedMatch}</span>`,
  )}</span>`

const prepareSearchResults = (list: Shout[], searchValue: string) =>
  list.sort(byScore()).map((article, index) => ({
    ...article,
    body: article.body,
    cover: article.cover,
    created_at: article.created_at,
    id: index,
    slug: article.slug,
    authors: article.authors,
    topics: article.topics,
    title: article.title
      ? getSearchCoincidences({
          str: article.title,
          intersection: searchValue,
        })
      : '',
    subtitle: article.subtitle
      ? getSearchCoincidences({
          str: article.subtitle,
          intersection: searchValue,
        })
      : '',
  }))

export const SearchModal = () => {
  const { t } = useLocalize()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [inputValue, setInputValue] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)
  const [offset, setOffset] = createSignal<number>(0)
  const [searchResultsList, { refetch: loadSearchResults, mutate: setSearchResultsList }] = createResource<
    Shout[] | null
  >(
    async () => {
      setIsLoading(true)
      const { hasMore, newShouts } = await loadShoutsSearch({
        limit: FEED_PAGE_SIZE,
        text: inputValue(),
        offset: offset(),
      })
      setIsLoading(false)
      setOffset(newShouts.length)
      setIsLoadMoreButtonVisible(hasMore)
      return newShouts
    },
    {
      ssrLoadFrom: 'initial',
      initialValue: null,
    },
  )

  let searchEl: HTMLInputElement
  const debouncedLoadMore = debounce(500, loadSearchResults)

  const handleQueryInput = async () => {
    setInputValue(searchEl.value)
    if (searchEl.value?.length > 2) {
      await debouncedLoadMore()
    } else {
      setIsLoading(false)
      setSearchResultsList(null)
    }
  }

  const enterQuery = async (ev: KeyboardEvent) => {
    setIsLoading(true)
    if (ev.key === 'Enter' && inputValue().length > 2) {
      await debouncedLoadMore()
    } else {
      setIsLoading(false)
      setSearchResultsList(null)
    }
    restoreScrollPosition()
    setIsLoading(false)
  }

  // Cleanup the debounce timer when the component unmounts
  onCleanup(() => {
    debouncedLoadMore.cancel()
    // console.debug('[SearchModal] cleanup debouncing search')
  })

  return (
    <div class={styles.searchContainer}>
      <input
        type="search"
        placeholder={t('Site search')}
        class={styles.searchInput}
        onInput={handleQueryInput}
        onKeyDown={enterQuery}
        ref={searchEl}
      />

      <Button
        class={styles.searchButton}
        onClick={debouncedLoadMore}
        value={isLoading() ? <div class={styles.searchLoader} /> : <Icon name="search" />}
      />

      <p
        class={styles.searchDescription}
        innerHTML={t(
          'To find publications, art, comments, authors and topics of interest to you, just start typing your query',
        )}
      />

      <Show when={!isLoading()}>
        <Show when={searchResultsList()}>
          <For each={prepareSearchResults(searchResultsList(), inputValue())}>
            {(article: Shout) => (
              <div>
                <SearchResultItem
                  article={article}
                  settings={{
                    isFloorImportant: true,
                    isSingle: true,
                    nodate: true,
                  }}
                />
              </div>
            )}
          </For>

          <Show when={isLoadMoreButtonVisible()}>
            <p class="load-more-container">
              <button class="button" onClick={loadSearchResults}>
                {t('Load more')}
              </button>
            </p>
          </Show>
        </Show>

        <Show when={Array.isArray(searchResultsList()) && searchResultsList().length === 0}>
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
