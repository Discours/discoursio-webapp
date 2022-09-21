import { createEffect, createMemo, onMount, Show } from 'solid-js'
import Banner from '../Discours/Banner'
import NavTopics from '../Nav/Topics'
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
import Icon from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useTopicsStore } from '../../stores/zine/topics'
import {
  loadPublishedArticles,
  loadTopArticles,
  loadTopMonthArticles,
  useArticlesStore
} from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'

const log = getLogger('home view')

type HomeProps = {
  randomTopics: Topic[]
  recentPublishedArticles: Shout[]
}

const CLIENT_LOAD_ARTICLES_COUNT = 30
const LOAD_MORE_ARTICLES_COUNT = 30

export const HomeView = (props: HomeProps) => {
  const {
    getSortedArticles,
    getTopArticles,
    getArticlesByAuthor,
    getTopMonthArticles,
    getTopViewedArticles,
    getTopCommentedArticles,
    getArticlesByLayout
  } = useArticlesStore({
    sortedArticles: props.recentPublishedArticles
  })
  const { getRandomTopics, getTopTopics } = useTopicsStore({
    randomTopics: props.randomTopics
  })

  const { getAuthorEntities } = useAuthorsStore()

  onMount(() => {
    // loadTopArticles()
    // loadTopMonthArticles()
    // loadPublishedArticles({ limit: CLIENT_LOAD_ARTICLES_COUNT, offset: getSortedArticles().length })
    loadPublishedArticles({ limit: 10, offset: getSortedArticles().length })
  })

  const randomLayout = createMemo(() => {
    const articlesByLayout = getArticlesByLayout()
    const filledLayouts = Object.keys(articlesByLayout).filter(
      (layout) => articlesByLayout[layout].length > 7
    )

    const randomLayout =
      filledLayouts.length > 0 ? filledLayouts[Math.floor(Math.random() * filledLayouts.length)] : ''

    // log.debug({ randomLayout })

    return (
      <Show when={Boolean(randomLayout)}>
        <Group
          articles={articlesByLayout[randomLayout]}
          header={
            <div class="layout-icon">
              <Icon name={randomLayout} />
            </div>
          }
        />
      </Show>
    )
  })

  const topAuthors = createMemo(() => {
    const articlesByAuthor = getArticlesByAuthor()
    const authorEntities = getAuthorEntities()

    const topAuthors = Object.keys(articlesByAuthor)
      .sort((authorSlug1, authorSlug2) => {
        const author1Rating = articlesByAuthor[authorSlug1].reduce(
          (acc, article) => acc + article.stat.rating,
          0
        )
        const author2Rating = articlesByAuthor[authorSlug2].reduce(
          (acc, article) => acc + article.stat.rating,
          0
        )
        if (author1Rating === author2Rating) {
          return 0
        }

        return author1Rating > author2Rating ? 1 : -1
      })
      .slice(0, 5)
      .map((authorSlug) => authorEntities[authorSlug])
      .filter(Boolean)

    // log.debug({ topAuthors })

    return (
      <Show when={topAuthors.length === 5}>
        <Beside
          beside={getSortedArticles()[9]}
          title={t('Top authors')}
          values={topAuthors}
          wrapper={'author'}
        />
      </Show>
    )
  })

  const loadMore = () => {
    loadPublishedArticles({ limit: LOAD_MORE_ARTICLES_COUNT, offset: getSortedArticles().length })
  }

  return (
    <>
      <NavTopics topics={getRandomTopics()} />
      <Row5 articles={getSortedArticles().slice(0, 5)} />
      <Hero />
      <Beside
        beside={getSortedArticles()[5]}
        title={t('Top viewed')}
        values={getTopViewedArticles().slice(0, 5)}
        wrapper={'top-article'}
      />
      <Row3 articles={getSortedArticles().slice(6, 9)} />

      {topAuthors()}

      <Slider title={t('Top month articles')} articles={getTopMonthArticles()} />

      <Row2 articles={getSortedArticles().slice(10, 12)} />
      <RowShort articles={getSortedArticles().slice(12, 16)} />
      <Row1 article={getSortedArticles()[16]} />
      <Row3 articles={getSortedArticles().slice(17, 20)} />
      <Row3 articles={getTopCommentedArticles()} header={<h2>{t('Top commented')}</h2>} />

      {randomLayout()}

      <Slider title={t('Favorite')} articles={getTopArticles()} />

      <Beside
        beside={getSortedArticles()[20]}
        title={t('Top topics')}
        values={getTopTopics().slice(0, 5)}
        wrapper={'topic'}
        isTopicCompact={true}
      />
      <Row3 articles={getSortedArticles().slice(21, 24)} />
      <Banner />
      <Row2 articles={getSortedArticles().slice(24, 26)} />
      <Row3 articles={getSortedArticles().slice(26, 29)} />
      <Row2 articles={getSortedArticles().slice(29, 31)} />
      <Row3 articles={getSortedArticles().slice(31, 34)} />

      <p class="load-more-container">
        <button class="button" onClick={loadMore}>
          {t('Load more')}
        </button>
      </p>
    </>
  )
}
