import { For, Show, createMemo, onMount, createSignal } from 'solid-js'
import type { Shout, Topic } from '../../graphql/types.gen'
import { Row3 } from '../Feed/Row3'
import { Row2 } from '../Feed/Row2'
import { Beside } from '../Feed/Beside'
import styles from '../../styles/Topic.module.scss'
import { FullTopic } from '../Topic/Full'

import { useRouter } from '../../stores/router'
import { useTopicsStore } from '../../stores/zine/topics'
import { loadShouts, useArticlesStore } from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'
import { clsx } from 'clsx'
import { Slider } from '../_shared/Slider'
import { Row1 } from '../Feed/Row1'
import { ArticleCard } from '../Feed/ArticleCard'
import { useLocalize } from '../../context/localize'

type TopicsPageSearchParams = {
  by: 'comments' | '' | 'recent' | 'viewed' | 'rating' | 'commented'
}

interface TopicProps {
  topic: Topic
  shouts: Shout[]
  topicSlug: string
}

export const PRERENDERED_ARTICLES_COUNT = 28
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const TopicView = (props: TopicProps) => {
  const { t } = useLocalize()
  const { searchParams, changeSearchParam } = useRouter<TopicsPageSearchParams>()

  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const { sortedArticles } = useArticlesStore({ shouts: props.shouts })
  const { topicEntities } = useTopicsStore({ topics: [props.topic] })

  const { authorsByTopic } = useAuthorsStore()

  const topic = createMemo(() => topicEntities()[props.topicSlug])

  const loadMore = async () => {
    saveScrollPosition()

    const { hasMore } = await loadShouts({
      filters: { topic: props.topicSlug },
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
    <div class={styles.topicPage}>
      <Show when={topic()}>
        <FullTopic topic={topic()} />
        <div class="wide-container">
          <div class={clsx(styles.groupControls, 'row group__controls')}>
            <div class="col-md-16">
              <ul class="view-switcher">
                <li
                  classList={{
                    'view-switcher__item--selected': searchParams().by === 'recent' || !searchParams().by
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeSearchParam({
                        by: 'recent'
                      })
                    }
                  >
                    {t('Recent')}
                  </button>
                </li>
                {/*TODO: server sort*/}
                {/*<li classList={{ 'view-switcher__item--selected': getSearchParams().by === 'rating' }}>*/}
                {/*  <button type="button" onClick={() => changeSearchParam('by', 'rating')}>*/}
                {/*    {t('Popular')}*/}
                {/*  </button>*/}
                {/*</li>*/}
                {/*<li classList={{ 'view-switcher__item--selected': getSearchParams().by === 'viewed' }}>*/}
                {/*  <button type="button" onClick={() => changeSearchParam('by', 'viewed')}>*/}
                {/*    {t('Views')}*/}
                {/*  </button>*/}
                {/*</li>*/}
                {/*<li classList={{ 'view-switcher__item--selected': getSearchParams().by === 'commented' }}>*/}
                {/*  <button type="button" onClick={() => changeSearchParam('by', 'commented')}>*/}
                {/*    {t('Discussing')}*/}
                {/*  </button>*/}
                {/*</li>*/}
              </ul>
            </div>
            <div class="col-md-8">
              <div class="mode-switcher">
                {`${t('Show')} `}
                <span class="mode-switcher__control">{t('All posts')}</span>
              </div>
            </div>
          </div>
        </div>

        <Row1 article={sortedArticles()[0]} />
        <Row2 articles={sortedArticles().slice(1, 3)} isEqual={true} />

        <Beside
          title={t('Topic is supported by')}
          values={authorsByTopic()[topic().slug].slice(0, 6)}
          beside={sortedArticles()[4]}
          wrapper={'author'}
        />

        <Slider title={title()}>
          <For each={sortedArticles().slice(5, 11)}>
            {(a: Shout) => (
              <ArticleCard
                article={a}
                settings={{
                  additionalClass: 'swiper-slide',
                  isFloorImportant: true,
                  isWithCover: true,
                  nodate: true
                }}
              />
            )}
          </For>
        </Slider>

        <Beside
          beside={sortedArticles()[12]}
          title={t('Top viewed')}
          values={sortedArticles().slice(0, 5)}
          wrapper={'top-article'}
        />

        <Row2 articles={sortedArticles().slice(13, 15)} isEqual={true} />
        <Row1 article={sortedArticles()[15]} />

        <Show when={sortedArticles().length > 15}>
          <Slider slidesPerView={3}>
            <For each={sortedArticles().slice(16, 22)}>
              {(a: Shout) => (
                <ArticleCard
                  article={a}
                  settings={{
                    additionalClass: 'swiper-slide',
                    isFloorImportant: true,
                    isWithCover: false,
                    nodate: true
                  }}
                />
              )}
            </For>
          </Slider>

          <Row3 articles={sortedArticles().slice(23, 26)} />
          <Row2 articles={sortedArticles().slice(26, 28)} />
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
      </Show>
    </div>
  )
}
