import { createMemo, For, onMount, Show } from 'solid-js'
import Banner from '../Discours/Banner'
import { NavTopics } from '../Nav/Topics'
import { Row5 } from '../Feed/Row5'
import Row3 from '../Feed/Row3'
import Row2 from '../Feed/Row2'
import Row1 from '../Feed/Row1'
import Hero from '../Discours/Hero'
import Beside from '../Feed/Beside'
import RowShort from '../Feed/RowShort'
import Slider from '../Feed/Slider'
import Group from '../Feed/Group'
import { getLogger } from '../../utils/logger'
import type { Shout, Topic } from '../../graphql/types.gen'
import { Icon } from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useTopicsStore } from '../../stores/zine/topics'
import {
  loadPublishedArticles,
  loadTopArticles,
  loadTopMonthArticles,
  useArticlesStore
} from '../../stores/zine/articles'
import { useTopAuthorsStore } from '../../stores/zine/topAuthors'
import { locale } from '../../stores/ui'

const log = getLogger('home view')

type HomeProps = {
  randomTopics: Topic[]
  recentPublishedArticles: Shout[]
}

const CLIENT_LOAD_ARTICLES_COUNT = 30
const LOAD_MORE_ARTICLES_COUNT = 30

export const HomeView = (props: HomeProps) => {
  const {
    sortedArticles,
    topArticles,
    topMonthArticles,
    topViewedArticles,
    topCommentedArticles,
    articlesByLayout
  } = useArticlesStore({
    sortedArticles: props.recentPublishedArticles
  })
  const { randomTopics, topTopics } = useTopicsStore({
    randomTopics: props.randomTopics
  })

  const { topAuthors } = useTopAuthorsStore()

  onMount(() => {
    loadTopArticles()
    loadTopMonthArticles()
    loadPublishedArticles({ limit: CLIENT_LOAD_ARTICLES_COUNT, offset: sortedArticles().length })
  })

  const randomLayout = createMemo(() => {
    const filledLayouts = Object.keys(articlesByLayout()).filter(
      // FIXME: is 7 ok? or more complex logic needed?
      (layout) => articlesByLayout()[layout].length > 7
    )

    const selectedRandomLayout =
      filledLayouts.length > 0 ? filledLayouts[Math.floor(Math.random() * filledLayouts.length)] : ''

    return (
      <Show when={Boolean(selectedRandomLayout)}>
        <Group
          articles={articlesByLayout()[selectedRandomLayout]}
          header={
            <div class="layout-icon">
              <Icon name={selectedRandomLayout} />
            </div>
          }
        />
      </Show>
    )
  })

  const loadMore = () => {
    loadPublishedArticles({ limit: LOAD_MORE_ARTICLES_COUNT, offset: sortedArticles().length })
  }

  return (
    <Show when={locale()}>
      <NavTopics topics={randomTopics()} />

      <Row5 articles={sortedArticles().slice(0, 5)} />

      <Hero />

      <Show when={sortedArticles().length > 5}>
        <Beside
          beside={sortedArticles()[5]}
          title={t('Top viewed')}
          values={topViewedArticles().slice(0, 5)}
          wrapper={'top-article'}
        />

        <Row3 articles={sortedArticles().slice(6, 9)} />

        {/*FIXME: ?*/}
        <Show when={topAuthors().length === 5}>
          <Beside
            beside={sortedArticles().slice(8, 9)[0]}
            title={t('Top authors')}
            values={topAuthors()}
            wrapper={'author'}
          />
        </Show>

        <Slider title={t('Top month articles')} articles={topMonthArticles()} />

        <Row2 articles={sortedArticles().slice(10, 12)} />

        <RowShort articles={sortedArticles().slice(12, 16)} />

        <Row1 article={sortedArticles().slice(15, 16)[0]} />
        <Row3 articles={sortedArticles().slice(17, 20)} />
        <Row3 articles={topCommentedArticles()} header={<h2>{t('Top commented')}</h2>} />

        {randomLayout()}

        <Slider title={t('Favorite')} articles={topArticles()} />

        <Beside
          beside={sortedArticles()[20]}
          title={t('Top topics')}
          values={topTopics().slice(0, 5)}
          wrapper={'topic'}
          isTopicCompact={true}
        />

        <Row3 articles={sortedArticles().slice(21, 24)} />

        <Banner />

        <Row2 articles={sortedArticles().slice(24, 26)} />
        <Row3 articles={sortedArticles().slice(26, 29)} />
        <Row2 articles={sortedArticles().slice(29, 31)} />
        <Row3 articles={sortedArticles().slice(31, 34)} />
      </Show>

      <For each={sortedArticles().slice(35)}>{(article) => <Row1 article={article} />}</For>

      <p class="load-more-container">
        <button class="button" onClick={loadMore}>
          {t('Load more')}
        </button>
      </p>
    </Show>
  )
}
