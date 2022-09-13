import { createEffect, createMemo, createSignal, onMount, Show, Suspense } from 'solid-js'
import Banner from '../Discours/Banner'
import NavTopics from '../Nav/Topics'
import Row5 from '../Feed/Row5'
import Row3 from '../Feed/Row3'
import Row2 from '../Feed/Row2'
import Row1 from '../Feed/Row1'
import Hero from '../Discours/Hero'
import Beside from '../Feed/Beside'
import RowShort from '../Feed/RowShort'
import Slider from '../Feed/Slider'
import Group from '../Feed/Group'
import type { Shout, Topic } from '../../graphql/types.gen'
import Icon from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useTopicsStore } from '../../stores/zine/topics'
import { loadPublishedArticles, useArticlesStore } from '../../stores/zine/articles'
import { useAuthorsStore } from '../../stores/zine/authors'

type HomeProps = {
  randomTopics: Topic[]
  recentPublishedArticles: Shout[]
  topMonthArticles: Shout[]
  topOverallArticles: Shout[]
  page?: number
  size?: number
}

const LAYOUTS = ['article', 'prose', 'music', 'video', 'image']

export const HomePage = (props: HomeProps) => {
  const [someLayout, setSomeLayout] = createSignal([] as Shout[])
  const [selectedLayout, setSelectedLayout] = createSignal('article')
  const [byLayout, setByLayout] = createSignal({} as { [layout: string]: Shout[] })
  const [byTopic, setByTopic] = createSignal({} as { [topic: string]: Shout[] })

  const {
    getSortedArticles,
    getTopRatedArticles,
    getTopRatedMonthArticles,
    getTopViewedArticles,
    getTopCommentedArticles
  } = useArticlesStore({
    sortedArticles: props.recentPublishedArticles,
    topRatedArticles: props.topOverallArticles,
    topRatedMonthArticles: props.topMonthArticles
  })

  const articles = createMemo(() => getSortedArticles())
  const { getRandomTopics, getSortedTopics, getTopTopics } = useTopicsStore({
    randomTopics: props.randomTopics
  })

  const { getTopAuthors } = useAuthorsStore()

  // FIXME
  // createEffect(() => {
  //   if (articles() && articles().length > 0 && Object.keys(byTopic()).length === 0) {
  //     console.debug('[home] ' + getRandomTopics().length.toString() + ' random topics loaded')
  //     console.debug('[home] ' + articles().length.toString() + ' overall shouts loaded')
  //     console.log('[home] preparing published articles...')
  //     // get shouts lists by
  //     const bl: { [key: string]: Shout[] } = {}
  //     const bt: { [key: string]: Shout[] } = {}
  //     articles().forEach((s: Shout) => {
  //       // by topic
  //       s.topics?.forEach(({ slug }: any) => {
  //         if (!bt[slug || '']) bt[slug || ''] = []
  //         bt[slug as string].push(s)
  //       })
  //       // by layout
  //       const l = s.layout || 'article'
  //       if (!bl[l]) bl[l] = []
  //       bl[l].push(s)
  //     })
  //     setByLayout(bl)
  //     setByTopic(bt)
  //     console.log('[home] some grouped articles are ready')
  //   }
  // }, [articles()])

  // FIXME
  // createEffect(() => {
  //   if (Object.keys(byLayout()).length > 0 && getSortedTopics()) {
  //     // random special layout pick
  //     const special = LAYOUTS.filter((la) => la !== 'article')
  //     const layout = special[Math.floor(Math.random() * special.length)]
  //     setSomeLayout(byLayout()[layout])
  //     setSelectedLayout(layout)
  //     console.log(`[home] <${layout}> layout picked`)
  //   }
  // }, [byLayout()])

  const loadMore = () => {
    // FIXME
    const page = (props.page || 1) + 1
    loadPublishedArticles({ page })
  }
  return (
    <Suspense fallback={t('Loading')}>
      <Show when={articles().length > 0}>
        <NavTopics topics={getRandomTopics()} />
        <Row5 articles={articles().slice(0, 5)} />
        <Hero />
        <Beside
          beside={articles().slice(5, 6)[0]}
          title={t('Top viewed')}
          values={getTopViewedArticles().slice(0, 5)}
          wrapper={'top-article'}
        />
        <Row3 articles={articles().slice(6, 9)} />
        <Beside
          beside={articles().slice(9, 10)[0]}
          title={t('Top authors')}
          values={getTopAuthors().slice(0, 5)}
          wrapper={'author'}
        />

        <Slider title={t('Top month articles')} articles={getTopRatedMonthArticles()} />

        <Row2 articles={articles().slice(10, 12)} />
        <RowShort articles={articles().slice(12, 16)} />
        <Row1 article={articles().slice(16, 17)[0]} />
        <Row3 articles={articles().slice(17, 20)} />
        <Row3 articles={getTopCommentedArticles()} header={<h2>{t('Top commented')}</h2>} />
        <Group
          articles={someLayout()}
          header={
            <div class="layout-icon">
              <Icon name={selectedLayout()} />
            </div>
          }
        />

        <Slider title={t('Favorite')} articles={getTopRatedArticles()} />

        <Beside
          beside={articles().slice(20, 21)[0]}
          title={t('Top topics')}
          values={getTopTopics().slice(0, 5)}
          wrapper={'topic'}
          isTopicCompact={true}
        />
        <Row3 articles={articles().slice(21, 24)} />
        <Banner />
        <Row2 articles={articles().slice(24, 26)} />
        <Row3 articles={articles().slice(26, 29)} />
        <Row2 articles={articles().slice(29, 31)} />
        <Row3 articles={articles().slice(31, 34)} />

        <p class="load-more-container">
          <button class="button" onClick={loadMore}>
            {t('Load more')}
          </button>
        </p>
      </Show>
    </Suspense>
  )
}
