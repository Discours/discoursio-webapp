import type { Shout, Topic } from '../../graphql/types.gen'

import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { For, Show, createMemo, onMount, createSignal } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useRouter } from '../../stores/router'
import { loadShouts, useArticlesStore } from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'
import { useTopicsStore } from '../../stores/zine/topics'
import { capitalize } from '../../utils/capitalize'
import { getImageUrl } from '../../utils/getImageUrl'
import { getDescription } from '../../utils/meta'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'
import { ArticleCardSwiper } from '../_shared/SolidSwiper/ArticleCardSwiper'
import { Beside } from '../Feed/Beside'
import { Row1 } from '../Feed/Row1'
import { Row2 } from '../Feed/Row2'
import { Row3 } from '../Feed/Row3'
import { FullTopic } from '../Topic/Full'

import styles from '../../styles/Topic.module.scss'

type TopicsPageSearchParams = {
  by: 'comments' | '' | 'recent' | 'viewed' | 'rating' | 'commented'
}

interface Props {
  topic: Topic
  shouts: Shout[]
  topicSlug: string
}

export const PRERENDERED_ARTICLES_COUNT = 28
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const TopicView = (props: Props) => {
  const { t } = useLocalize()
  const { searchParams, changeSearchParams } = useRouter<TopicsPageSearchParams>()

  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const { sortedArticles } = useArticlesStore({ shouts: props.shouts })
  const { topicEntities } = useTopicsStore({ topics: [props.topic] })

  const { authorsByTopic } = useAuthorsStore()

  const topic = createMemo(() => topicEntities()[props.topicSlug])

  onMount(() => {
    document.title = topic().title
  })

  const loadMore = async () => {
    saveScrollPosition()

    const { hasMore } = await loadShouts({
      filters: { topic: props.topicSlug },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length,
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
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE),
  )

  const pageTitle = `#${capitalize(topic().title, true)}`

  const ogImage = topic().pic
    ? getImageUrl(topic().pic, { width: 1200 })
    : getImageUrl('production/image/logo_image.png')
  const description = topic().body
    ? getDescription(topic().body)
    : t('The most interesting publications on the topic', { topicName: pageTitle })
  const ogTitle = pageTitle

  return (
    <div class={styles.topicPage}>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('topicKeywords', { topic: pageTitle })} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />
      <FullTopic topic={topic()} />
      <div class="wide-container">
        <div class={clsx(styles.groupControls, 'row group__controls')}>
          <div class="col-md-16">
            <ul class="view-switcher">
              <li
                classList={{
                  'view-switcher__item--selected': searchParams().by === 'recent' || !searchParams().by,
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

      <Row1 article={sortedArticles()[0]} />
      <Row2 articles={sortedArticles().slice(1, 3)} isEqual={true} />

      <Beside
        title={t('Topic is supported by')}
        values={authorsByTopic()[topic().slug].slice(0, 6)}
        beside={sortedArticles()[3]}
        wrapper={'author'}
      />

      <ArticleCardSwiper title={title()} slides={sortedArticles().slice(4, 11)} />

      <Beside
        beside={sortedArticles()[11]}
        title={t('Top viewed')}
        values={sortedArticles().slice(0, 5)}
        wrapper={'top-article'}
      />

      <Row2 articles={sortedArticles().slice(12, 14)} isEqual={true} />
      <Row1 article={sortedArticles()[14]} />

      <Show when={sortedArticles().length > 14}>
        <ArticleCardSwiper slides={sortedArticles().slice(15, 21)} />
        <Row3 articles={sortedArticles().slice(22, 25)} />
        <Row2 articles={sortedArticles().slice(25, 27)} />
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
