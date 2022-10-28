import { For, Show, createMemo, onMount, createSignal } from 'solid-js'
import type { Shout, Topic } from '../../graphql/types.gen'
import { Row3 } from '../Feed/Row3'
import { Row2 } from '../Feed/Row2'
import { Beside } from '../Feed/Beside'
import { ArticleCard } from '../Feed/Card'
import '../../styles/Topic.scss'
import { FullTopic } from '../Topic/Full'
import { t } from '../../utils/intl'
import { useRouter } from '../../stores/router'
import { useTopicsStore } from '../../stores/zine/topics'
import { loadPublishedArticles, useArticlesStore } from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'

type TopicsPageSearchParams = {
  by: 'comments' | '' | 'recent' | 'viewed' | 'rating' | 'commented'
}

interface TopicProps {
  topic: Topic
  topicArticles: Shout[]
  topicSlug: string
}

export const PRERENDERED_ARTICLES_COUNT = 21
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const TopicView = (props: TopicProps) => {
  const { searchParams, changeSearchParam } = useRouter<TopicsPageSearchParams>()

  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const { sortedArticles } = useArticlesStore({ sortedArticles: props.topicArticles })
  const { topicEntities } = useTopicsStore({ topics: [props.topic] })

  const { authorsByTopic } = useAuthorsStore()

  const topic = createMemo(() => topicEntities()[props.topicSlug])

  const loadMore = async () => {
    saveScrollPosition()

    const { hasMore } = await loadPublishedArticles({
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
    <div class="topic-page container">
      <Show when={topic()}>
        <FullTopic topic={topic()} />
        <div class="row group__controls">
          <div class="col-md-8">
            <ul class="view-switcher">
              <li classList={{ selected: searchParams().by === 'recent' || !searchParams().by }}>
                <button type="button" onClick={() => changeSearchParam('by', 'recent')}>
                  {t('Recent')}
                </button>
              </li>
              {/*TODO: server sort*/}
              {/*<li classList={{ selected: getSearchParams().by === 'rating' }}>*/}
              {/*  <button type="button" onClick={() => changeSearchParam('by', 'rating')}>*/}
              {/*    {t('Popular')}*/}
              {/*  </button>*/}
              {/*</li>*/}
              {/*<li classList={{ selected: getSearchParams().by === 'viewed' }}>*/}
              {/*  <button type="button" onClick={() => changeSearchParam('by', 'viewed')}>*/}
              {/*    {t('Views')}*/}
              {/*  </button>*/}
              {/*</li>*/}
              {/*<li classList={{ selected: getSearchParams().by === 'commented' }}>*/}
              {/*  <button type="button" onClick={() => changeSearchParam('by', 'commented')}>*/}
              {/*    {t('Discussing')}*/}
              {/*  </button>*/}
              {/*</li>*/}
            </ul>
          </div>
          <div class="col-md-4">
            <div class="mode-switcher">
              {`${t('Show')} `}
              <span class="mode-switcher__control">{t('All posts')}</span>
            </div>
          </div>
        </div>

        <div class="row floor floor--important">
          <div class="container">
            <div class="row">
              <h3 class="col-12">{title()}</h3>
              <For each={sortedArticles().slice(0, 6)}>
                {(article) => (
                  <div class="col-md-6">
                    <ArticleCard
                      article={article}
                      settings={{ isFloorImportant: true, isBigTitle: true }}
                    />
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="row">
          <Show when={sortedArticles().length > 5}>
            <Beside
              title={t('Topic is supported by')}
              values={authorsByTopic()[topic().slug].slice(0, 7)}
              beside={sortedArticles()[6]}
              wrapper={'author'}
            />
            <Row3 articles={sortedArticles().slice(7, 10)} />
            <Row2 articles={sortedArticles().slice(10, 12)} />
            <Row3 articles={sortedArticles().slice(12, 15)} />
            <Row3 articles={sortedArticles().slice(15, 18)} />
            <Row3 articles={sortedArticles().slice(18, 21)} />
          </Show>

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
