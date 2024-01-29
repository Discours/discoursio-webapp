import type { Shout } from '../../../graphql/schema/core.gen'

import { createSignal, Show, For } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { loadShoutsSearch, useArticlesStore } from '../../../stores/zine/articles'
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

const getSearchCoincidences = ({ str, intersection }: { str: string; intersection: string }) =>
  `<span>${str.replaceAll(
    new RegExp(intersection, 'gi'),
    (casePreservedMatch) => `<span class="blackModeIntersection">${casePreservedMatch}</span>`,
  )}</span>`

const prepareSearchResults = (list, searchValue) =>
  list.map((article, index) => ({
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
  const { sortedArticles } = useArticlesStore()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [offset, setOffset] = createSignal(0)
  const [inputValue, setInputValue] = createSignal('')
  //const [searchResultsList, setSearchResultsList] = createSignal<[] | null>([])
  const [isLoading, setIsLoading] = createSignal(false)
  // const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  let searchEl: HTMLInputElement
  const handleQueryChange = async (_ev) => {
    setInputValue(searchEl.value)

    if (inputValue() && inputValue().length > 2) await loadMore()
  }

  const loadMore = async () => {
    setIsLoading(true)
    saveScrollPosition()
    if (inputValue() && inputValue().length > 2) {
      console.log(inputValue())
      const { hasMore } = await loadShoutsSearch({
        text: inputValue(),
        offset: offset(),
        limit: FEED_PAGE_SIZE,
      })
      setIsLoadMoreButtonVisible(hasMore)
      setOffset(offset() + FEED_PAGE_SIZE)
    } else {
      console.warn('[SaerchView] no query found')
    }
    restoreScrollPosition()
    setIsLoading(false)
  }

  return (
    <div class={styles.searchContainer}>
      <input
        type="search"
        placeholder={t('Site search')}
        class={styles.searchInput}
        onInput={handleQueryChange}
        ref={searchEl}
      />

      <Button
        class={styles.searchButton}
        onClick={loadMore}
        value={isLoading() ? <div class={styles.searchLoader} /> : <Icon name="search" />}
      />

      <p
        class={styles.searchDescription}
        innerHTML={t(
          'To find publications, art, comments, authors and topics of interest to you, just start typing your query',
        )}
      />

      <Show when={!isLoading()}>
        <Show when={sortedArticles()}>
          <For each={sortedArticles().sort(byScore())}>
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
              <button class="button" onClick={loadMore}>
                {t('Load more')}
              </button>
            </p>
          </Show>
        </Show>

        <Show when={!sortedArticles()}>
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
