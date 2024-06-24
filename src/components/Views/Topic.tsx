import { Author, AuthorsBy, LoadShoutsOptions, Shout, Topic } from '../../graphql/schema/core.gen'

import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'

import { useSearchParams } from '@solidjs/router'
import { useGraphQL } from '~/context/graphql'
import getRandomTopShoutsQuery from '~/graphql/query/core/articles-load-random-top'
import loadShoutsRandomQuery from '~/graphql/query/core/articles-load-random-topic'
import loadAuthorsByQuery from '~/graphql/query/core/authors-load-by'
import getTopicFollowersQuery from '~/graphql/query/core/topic-followers'
import { useAuthors } from '../../context/authors'
import { useFeed } from '../../context/feed'
import { useLocalize } from '../../context/localize'
import { useTopics } from '../../context/topics'
import styles from '../../styles/Topic.module.scss'
import { capitalize } from '../../utils/capitalize'
import { getImageUrl } from '../../utils/getImageUrl'
import { getUnixtime } from '../../utils/getServerDate'
import { getDescription } from '../../utils/meta'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'
import { Beside } from '../Feed/Beside'
import { Row1 } from '../Feed/Row1'
import { Row2 } from '../Feed/Row2'
import { Row3 } from '../Feed/Row3'
import { FullTopic } from '../Topic/Full'
import { ArticleCardSwiper } from '../_shared/SolidSwiper/ArticleCardSwiper'

type TopicsPageSearchParams = {
  by: 'comments' | '' | 'recent' | 'viewed' | 'rating' | 'commented'
}

interface Props {
  topic: Topic
  shouts: Shout[]
  topicSlug: string
  followers?: Author[]
}

export const PRERENDERED_ARTICLES_COUNT = 28
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const TopicView = (props: Props) => {
  const { t, lang } = useLocalize()
  const { query } = useGraphQL()
  const [searchParams, changeSearchParams] = useSearchParams<TopicsPageSearchParams>()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const { feedByTopic, loadShouts } = useFeed()
  const sortedFeed = createMemo(() => feedByTopic()[topic()?.slug || ''] || [])
  const { topicEntities } = useTopics()
  const { authorsByTopic } = useAuthors()
  const [favoriteTopArticles, setFavoriteTopArticles] = createSignal<Shout[]>([])
  const [reactedTopMonthArticles, setReactedTopMonthArticles] = createSignal<Shout[]>([])

  const [topic, setTopic] = createSignal<Topic>()
  createEffect(
    on([() => props.topicSlug, topic, topicEntities], async ([slug, t, ttt]) => {
      if (slug && !t && ttt) {
        const current = slug in ttt ? ttt[slug] : null
        console.debug(current)
        setTopic(current as Topic)
        await loadTopicFollowers()
        await loadTopicAuthors()
        loadRandom()
      }
    }),
  )

  const [followers, setFollowers] = createSignal<Author[]>(props.followers || [])
  const loadTopicFollowers = async () => {
    const resp = await query(getTopicFollowersQuery, { slug: props.topicSlug }).toPromise()
    setFollowers(resp?.data?.get_topic_followers || [])
  }
  const [topicAuthors, setTopicAuthors] = createSignal<Author[]>([])
  const loadTopicAuthors = async () => {
    const by: AuthorsBy = { topic: props.topicSlug }
    const resp = await query(loadAuthorsByQuery, { by, limit: 10, offset: 0 }).toPromise()
    setTopicAuthors(resp?.data?.load_authors_by || [])
  }

  const loadFavoriteTopArticles = async (topic: string) => {
    const options: LoadShoutsOptions = {
      filters: { featured: true, topic: topic },
      limit: 10,
      random_limit: 100,
    }
    const resp = await query(getRandomTopShoutsQuery, { options }).toPromise()
    setFavoriteTopArticles(resp?.data?.l)
  }

  const loadReactedTopMonthArticles = async (topic: string) => {
    const now = new Date()
    const after = getUnixtime(new Date(now.setMonth(now.getMonth() - 1)))

    const options: LoadShoutsOptions = {
      filters: { after: after, featured: true, topic: topic },
      limit: 10,
      random_limit: 10,
    }

    const resp = await query(loadShoutsRandomQuery, { options }).toPromise()
    setReactedTopMonthArticles(resp?.data?.load_shouts_random)
  }

  const loadRandom = () => {
    if (topic()) {
      loadFavoriteTopArticles((topic() as Topic).slug)
      loadReactedTopMonthArticles((topic() as Topic).slug)
    }
  }

  const title = createMemo(
    () =>
      `#${capitalize(
        lang() === 'en'
          ? (topic() as Topic)?.slug.replace(/-/, ' ')
          : (topic() as Topic)?.title || (topic() as Topic)?.slug.replace(/-/, ' '),
        true,
      )}`,
  )

  const loadMore = async () => {
    saveScrollPosition()

    const { hasMore } = await loadShouts({
      filters: { topic: topic()?.slug },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedFeed().length, // FIXME: use feedByTopic
    })
    setIsLoadMoreButtonVisible(hasMore)

    restoreScrollPosition()
  }

  onMount(() => {
    loadRandom()
    if (sortedFeed() || [].length === PRERENDERED_ARTICLES_COUNT) {
      loadMore()
    }
  })
  /*
  const selectionTitle = createMemo(() => {
    const m = searchParams?.by
    if (m === 'viewed') return t('Top viewed')
    if (m === 'rating') return t('Top rated')
    if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })
  */
  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedFeed(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE),
  )

  const ogImage = () =>
    topic()?.pic
      ? getImageUrl(topic()?.pic || '', { width: 1200 })
      : getImageUrl('production/image/logo_image.png')
  const description = () =>
    topic()?.body
      ? getDescription(topic()?.body || '')
      : t('The most interesting publications on the topic', { topicName: title() })

  return (
    <div class={styles.topicPage}>
      <Meta name="descprition" content={description()} />
      <Meta name="keywords" content={t('topicKeywords', { topic: title() })} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={title()} />
      <Meta name="og:image" content={ogImage()} />
      <Meta name="twitter:image" content={ogImage()} />
      <Meta name="og:description" content={description()} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={title()} />
      <Meta name="twitter:description" content={description()} />
      <FullTopic topic={topic() as Topic} followers={followers()} authors={topicAuthors()} />
      <div class="wide-container">
        <div class={clsx(styles.groupControls, 'row group__controls')}>
          <div class="col-md-16">
            <ul class="view-switcher">
              <li
                classList={{
                  'view-switcher__item--selected': searchParams?.by === 'recent' || !searchParams?.by,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    changeSearchParams({
                      by: 'recent',
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
        values={authorsByTopic()[topic()?.slug || '']?.slice(0, 6)}
        beside={sortedFeed()[4]}
        wrapper={'author'}
      />
      <Show when={reactedTopMonthArticles()?.length > 0} keyed={true}>
        <ArticleCardSwiper title={t('Top month')} slides={reactedTopMonthArticles()} />
      </Show>
      <Beside
        beside={sortedFeed()[12]}
        title={t('Top viewed')}
        values={sortedFeed().slice(0, 5)}
        wrapper={'top-article'}
      />

      <Row2 articles={sortedFeed().slice(13, 15)} isEqual={true} />
      <Row1 article={sortedFeed()[15]} />

      <Show when={favoriteTopArticles()?.length > 0} keyed={true}>
        <ArticleCardSwiper title={t('Favorite')} slides={favoriteTopArticles()} />
      </Show>
      <Show when={sortedFeed().length > 15}>
        <Row3 articles={sortedFeed().slice(23, 26)} />
        <Row2 articles={sortedFeed().slice(26, 28)} />
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
  )
}
