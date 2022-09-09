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
import {
  setTopRated,
  topRated,
  topViewed,
  topAuthors,
  topTopics,
  topRatedMonth,
  topCommented
} from '../../stores/zine/top'
import { useTopicsStore } from '../../stores/zine/topics'
import { useArticlesStore } from '../../stores/zine/articles'

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
  const { getSortedArticles } = useArticlesStore({ sortedArticles: props.recentPublishedArticles })
  const articles = createMemo(() => getSortedArticles())
  const { getRandomTopics, getSortedTopics } = useTopicsStore({ randomTopics: props.randomTopics })

  createEffect(() => {
    if (articles() && articles().length > 0 && Object.keys(byTopic()).length === 0) {
      console.debug('[home] ' + getRandomTopics().length.toString() + ' random topics loaded')
      console.debug('[home] ' + articles().length.toString() + ' overall shouts loaded')
      console.log('[home] preparing published articles...')
      // get shouts lists by
      const bl: { [key: string]: Shout[] } = {}
      const bt: { [key: string]: Shout[] } = {}
      articles().forEach((s: Shout) => {
        // by topic
        s.topics?.forEach(({ slug }: any) => {
          if (!bt[slug || '']) bt[slug || ''] = []
          bt[slug as string].push(s)
        })
        // by layout
        const l = s.layout || 'article'
        if (!bl[l]) bl[l] = []
        bl[l].push(s)
      })
      setByLayout(bl)
      setByTopic(bt)
      console.log('[home] some grouped articles are ready')
    }
  }, [articles()])

  createEffect(() => {
    if (Object.keys(byLayout()).length > 0 && getSortedTopics()) {
      // random special layout pick
      const special = LAYOUTS.filter((la) => la !== 'article')
      const layout = special[Math.floor(Math.random() * special.length)]
      setSomeLayout(byLayout()[layout])
      setSelectedLayout(layout)
      console.log(`[home] <${layout}> layout picked`)
    }
  }, [byLayout()])

  onMount(() => {
    if (props.topOverallArticles) setTopRated(props.topOverallArticles)
    console.info('[home] mounted')
  })

  const loadMore = () => {
    const size = props['size'] || 50
    const page = (props.page || 1) + 1
    console.log('[home] try to load ' + page + ' page with ' + size + ' items')
    // FIXME: loadPublished({ page, size })
  }
  return (
    <Suspense fallback={t('Loading')}>
      <Show when={Boolean(articles())}>
        <NavTopics topics={getRandomTopics()} />
        <Row5 articles={articles().slice(0, 5) as []} />
        <Hero />
        <Beside
          beside={articles().slice(5, 6)[0] as Shout}
          title={t('Top viewed')}
          values={topViewed()}
          wrapper={'top-article'}
        />
        <Row3 articles={articles().slice(6, 9) as []} />
        <Beside
          beside={articles().slice(9, 10)[0] as Shout}
          title={t('Top authors')}
          values={topAuthors()}
          wrapper={'author'}
        />

        <Slider title={t('Top month articles')} articles={topRatedMonth()} />

        <Row2 articles={articles().slice(10, 12) as []} />
        <RowShort articles={articles().slice(12, 16) as []} />
        <Row1 article={articles().slice(16, 17)[0] as Shout} />
        <Row3 articles={articles().slice(17, 20) as []} />
        <Row3 articles={topCommented()} header={<h2>{t('Top commented')}</h2>} />
        <Group
          articles={someLayout()}
          header={
            <div class="layout-icon">
              <Icon name={selectedLayout()} />
            </div>
          }
        />

        <Slider title={t('Favorite')} articles={topRated()} />

        <Beside
          beside={articles().slice(20, 21)[0] as Shout}
          title={t('Top topics')}
          values={topTopics()}
          wrapper={'topic'}
          isTopicCompact={true}
        />
        <Row3 articles={articles().slice(21, 24) as []} />
        <Banner />
        <Row2 articles={articles().slice(24, 26) as []} />
        <Row3 articles={articles().slice(26, 29) as []} />
        <Row2 articles={articles().slice(29, 31) as []} />
        <Row3 articles={articles().slice(31, 34) as []} />

        <p class="load-more-container">
          <button class="button" onClick={loadMore}>
            {t('Load more')}
          </button>
        </p>
      </Show>
    </Suspense>
  )
}
