import { Show, createMemo, createSignal, For, onMount } from 'solid-js'
import type { Author, Shout } from '../../graphql/types.gen'
import { Row2 } from '../Feed/Row2'
import { Row3 } from '../Feed/Row3'
import { AuthorFull } from '../Author/Full'
import { t } from '../../utils/intl'
import { useAuthorsStore } from '../../stores/zine/authors'
import { loadAuthorArticles, useArticlesStore } from '../../stores/zine/articles'

import { useTopicsStore } from '../../stores/zine/topics'
import { useRouter } from '../../stores/router'
import { Beside } from '../Feed/Beside'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'

// TODO: load reactions on client
type AuthorProps = {
  authorArticles: Shout[]
  author: Author
  authorSlug: string
  // FIXME author topics fro server
  // topics: Topic[]
}

type AuthorPageSearchParams = {
  by: '' | 'viewed' | 'rating' | 'commented' | 'recent' | 'followed'
}

export const PRERENDERED_ARTICLES_COUNT = 12
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const AuthorView = (props: AuthorProps) => {
  const { sortedArticles } = useArticlesStore({
    sortedArticles: props.authorArticles
  })
  const { authorEntities } = useAuthorsStore({ authors: [props.author] })
  const { topicsByAuthor } = useTopicsStore()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const author = createMemo(() => authorEntities()[props.authorSlug])
  const { searchParams, changeSearchParam } = useRouter<AuthorPageSearchParams>()

  const loadMore = async () => {
    saveScrollPosition()
    const { hasMore } = await loadAuthorArticles({
      authorSlug: author().slug,
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  onMount(async () => {
    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      loadMore()
    }
  })

  const title = createMemo(() => {
    const m = searchParams().by
    if (m === 'viewed') return t('Top viewed')
    if (m === 'rating') return t('Top rated')
    if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )

  return (
    <div class="container author-page">
      <Show when={author()} fallback={<div class="center">{t('Loading')}</div>}>
        <AuthorFull author={author()} />
        <div class="row group__controls">
          <div class="col-md-8">
            <ul class="view-switcher">
              <li classList={{ selected: searchParams().by === 'rating' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'rating')}>
                  {t('Popular')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'followed' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'followed')}>
                  {t('Followers')}
                </button>
              </li>
              <li classList={{ selected: searchParams().by === 'commented' }}>
                <button type="button" onClick={() => changeSearchParam('by', 'commented')}>
                  {t('Discussing')}
                </button>
              </li>
            </ul>
          </div>
          <div class="col-md-4">
            <div class="mode-switcher">
              {`${t('Show')} `}
              <span class="mode-switcher__control">{t('All posts')}</span>
            </div>
          </div>
        </div>

        <h3 class="col-12">{title()}</h3>

        <div class="row">
          <Beside
            title={t('Topics which supported by author')}
            values={topicsByAuthor()[author().slug].slice(0, 5)}
            beside={sortedArticles()[0]}
            wrapper={'topic'}
            topicShortDescription={true}
            isTopicCompact={true}
            isTopicInRow={true}
            iconButton={true}
          />
          <Row3 articles={sortedArticles().slice(1, 4)} />
          <Row2 articles={sortedArticles().slice(4, 6)} />
          <Row3 articles={sortedArticles().slice(6, 9)} />
          <Row3 articles={sortedArticles().slice(9, 12)} />

          <For each={pages()}>
            {(page) => (
              <>
                <Row3 articles={page.slice(0, 3)} />
                <Row3 articles={page.slice(3, 6)} />
                <Row3 articles={page.slice(6, 9)} />
              </>
            )}
          </For>

          <Show when={isLoadMoreButtonVisible()}>
            <p class="load-more-container">
              <button class="button" onClick={loadMore}>
                {t('Load more')}
              </button>
            </p>
          </Show>
        </div>
      </Show>
    </div>
  )
}
