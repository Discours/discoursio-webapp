import { useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Match, Show, Suspense, Switch, createEffect, createSignal, on } from 'solid-js'
import { useAuthors } from '~/context/authors'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { useTopics } from '~/context/topics'
import { loadAuthors, loadFollowersByTopic, loadShouts } from '~/graphql/api/public'
import { Author, AuthorsBy, LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { SHOUTS_PER_PAGE } from '~/routes/(main)'
import { getUnixtime } from '~/utils/date'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import styles from '../../styles/Topic.module.scss'
import { Beside } from '../Feed/Beside'
import { Row1 } from '../Feed/Row1'
import { Row2 } from '../Feed/Row2'
import { Row3 } from '../Feed/Row3'
import { FullTopic } from '../Topic/Full'
import { LoadMoreItems, LoadMoreWrapper } from '../_shared/LoadMoreWrapper'
import { Loading } from '../_shared/Loading'
import { ArticleCardSwiper } from '../_shared/SolidSwiper/ArticleCardSwiper'

export type TopicFeedSortBy = 'comments' | '' | 'recent' | 'viewed' | 'rating' | 'last_comment'

interface Props {
  topic: Topic
  shouts: Shout[]
  topicSlug: string
  followers?: Author[]
  selectedTab?: TopicFeedSortBy
}

export const PRERENDERED_ARTICLES_COUNT = 28
// const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const TopicView = (props: Props) => {
  const { t } = useLocalize()
  const { feedByTopic, addFeed } = useFeed()
  const { topicEntities } = useTopics()
  const { authorsByTopic } = useAuthors()
  const [searchParams, changeSearchParams] = useSearchParams<{ by: TopicFeedSortBy }>()
  const [favoriteTopArticles, setFavoriteTopArticles] = createSignal<Shout[]>([])
  const [reactedTopMonthArticles, setReactedTopMonthArticles] = createSignal<Shout[]>([])
  const [topic, setTopic] = createSignal<Topic>()
  const [followers, setFollowers] = createSignal<Author[]>(props.followers || [])

  // TODO: filter + sort
  const [sortedFeed, setSortedFeed] = createSignal([] as Shout[])
  createEffect(on(([feedByTopic, () => props.topicSlug, topicEntities]), ([feed, slug, ttt]) => {
        if (Object.values(ttt).length === 0) return
        const sss = (feed[slug] || []) as Shout[]
        sss && setSortedFeed(sss)
        console.debug('topic slug loaded', slug)
        const tpc = ttt[slug]
        console.debug('topics loaded', ttt)
        tpc && setTopic(tpc)
  }, {}))

  const loadTopicFollowers = async () => {
    const topicFollowersFetcher = loadFollowersByTopic(props.topicSlug)
    const topicFollowers = await topicFollowersFetcher()
    topicFollowers && setFollowers(topicFollowers)
    console.debug('loadTopicFollowers', topicFollowers)
  }

  const [topicAuthors, setTopicAuthors] = createSignal<Author[]>([])
  const loadTopicAuthors = async () => {
    const by: AuthorsBy = { topic: props.topicSlug }
    const topicAuthorsFetcher = await loadAuthors({ by, limit: 10, offset: 0 })
    const result = await topicAuthorsFetcher()
    result && setTopicAuthors(result)
    console.debug('loadTopicAuthors', result)
  }

  const loadFavoriteTopArticles = async () => {
    const options: LoadShoutsOptions = {
      filters: { featured: true, topic: props.topicSlug },
      limit: 10,
      random_limit: 100
    }
    const topicRandomShoutsFetcher = loadShouts(options)
    const result = await topicRandomShoutsFetcher()
    result && setFavoriteTopArticles(result)
    console.debug('loadFavoriteTopArticles', result)
  }

  const loadReactedTopMonthArticles = async () => {
    const now = new Date()
    const after = getUnixtime(new Date(now.setMonth(now.getMonth() - 1)))

    const options: LoadShoutsOptions = {
      filters: { after: after, featured: true, topic: props.topicSlug },
      limit: 10,
      random_limit: 10
    }

    const reactedTopMonthShoutsFetcher = loadShouts(options)
    const result = await reactedTopMonthShoutsFetcher()
    result && setReactedTopMonthArticles(result)
    console.debug('loadReactedTopMonthArticles', result)
  }

  // второй этап начальной загрузки данных
  createEffect(on(topic, (tpc) => {
        console.debug('topic loaded', tpc)
        if (!tpc) return
        loadFavoriteTopArticles()
        loadReactedTopMonthArticles()
        loadTopicAuthors()
        loadTopicFollowers()
  }, { defer: true }))

  // дозагрузка
  const loadMore = async () => {
    saveScrollPosition()
    const amountBefore = feedByTopic()?.[props.topicSlug]?.length || 0
    const topicShoutsFetcher = loadShouts({
      filters: { topic: props.topicSlug },
      limit: SHOUTS_PER_PAGE,
      offset: amountBefore
    })
    const result = await topicShoutsFetcher()
    result && addFeed(result)
    restoreScrollPosition()
    return result as LoadMoreItems
  }

  /*
  const selectionTitle = createMemo(() => {
    const m = searchParams?.by
    if (m === 'viewed') return t('Top viewed')
    if (m === 'rating') return t('Top rated')
    if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })
  */

  return (
    <div class={styles.topicPage}>
      <Suspense fallback={<Loading />}>
        <Show when={topic()}><FullTopic topic={topic() as Topic} followers={followers()} authors={topicAuthors()} /></Show>
        <div class="wide-container">
          <div class={clsx(styles.groupControls, 'row group__controls')}>
            <div class="col-md-16">
              <ul class="view-switcher">
                <li
                  classList={{
                    'view-switcher__item--selected': searchParams?.by === 'recent' || !searchParams?.by
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeSearchParams({
                        by: 'recent'
                      })
                    }
                  >
                    {t('Recent')}
                  </button>
                </li>
                {/*TODO: server sort*/}
                {/*<li classList={{ 'view-switcher__item--selected': getSearchParams().by === 'rating' }}>*/}
                {/*  <button type="button" onClick={() => changeSearchParams('by', 'rating')}>*/}
                {/*    {t('Popular')}*/}
                {/*  </button>*/}
                {/*</li>*/}
                {/*<li classList={{ 'view-switcher__item--selected': getSearchParams().by === 'viewed' }}>*/}
                {/*  <button type="button" onClick={() => changeSearchParams('by', 'viewed')}>*/}
                {/*    {t('Views')}*/}
                {/*  </button>*/}
                {/*</li>*/}
                {/*<li classList={{ 'view-switcher__item--selected': getSearchParams().by === 'commented' }}>*/}
                {/*  <button type="button" onClick={() => changeSearchParams('by', 'commented')}>*/}
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

        <Row1 article={sortedFeed()[0]} />
        <Row2 articles={sortedFeed().slice(1, 3)} isEqual={true} />

        <Beside
          title={t('Topic is supported by')}
          values={authorsByTopic?.()?.[topic()?.slug || '']?.slice(0, 6)}
          beside={sortedFeed()[3]}
          wrapper={'author'}
        />
        <Show when={reactedTopMonthArticles()?.length > 0} keyed={true}>
          <ArticleCardSwiper title={t('Top month')} slides={reactedTopMonthArticles()} />
        </Show>
        <Beside
          beside={sortedFeed()[11]}
          title={t('Top viewed')}
          values={sortedFeed().slice(0, 5)}
          wrapper={'top-article'}
        />

        <Row2 articles={sortedFeed().slice(12, 14)} isEqual={true} />
        <Row1 article={sortedFeed()[14]} />

        <Show when={favoriteTopArticles()?.length > 0} keyed={true}>
          <ArticleCardSwiper title={t('Favorite')} slides={favoriteTopArticles()} />
        </Show>

        <Show when={sortedFeed().length > 14}>
          <Row3 articles={sortedFeed().slice(14, 17)} />
          <Row2 articles={sortedFeed().slice(17, 19)} />
        </Show>

        <LoadMoreWrapper loadFunction={loadMore} pageSize={SHOUTS_PER_PAGE}>
        <For each={sortedFeed().slice(19).filter((_, i) => i % 3 === 0)}>
          {(_shout, index) => {
            const articles = sortedFeed().slice(19).slice(index() * 3, index() * 3 + 3);
            return (
              <>
                <Switch>
                  <Match when={articles.length === 1}>
                    <Row1 article={articles[0]} noauthor={true} nodate={true} />
                  </Match>
                  <Match when={articles.length === 2}>
                    <Row2 articles={articles} noauthor={true} nodate={true} isEqual={true} />
                  </Match>
                  <Match when={articles.length === 3}>
                    <Row3 articles={articles} noauthor={true} nodate={true} />
                  </Match>
                </Switch>
              </>
            );
          }}
        </For>
        </LoadMoreWrapper>
      </Suspense>
    </div>
  )
}
