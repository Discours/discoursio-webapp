import { For, Show, createEffect, createMemo, createSignal, on } from 'solid-js'

import { useAuthors } from '~/context/authors'
import { useLocalize } from '../../context/localize'
import { useTopics } from '../../context/topics'
import { Shout, Topic } from '../../graphql/schema/core.gen'
import { capitalize } from '../../utils/capitalize'
import { splitToPages } from '../../utils/splitToPages'
import Banner from '../Discours/Banner'
import Hero from '../Discours/Hero'
import { Beside } from '../Feed/Beside'
import Group from '../Feed/Group'
import { Row1 } from '../Feed/Row1'
import { Row2 } from '../Feed/Row2'
import { Row3 } from '../Feed/Row3'
import { Row5 } from '../Feed/Row5'
import RowShort from '../Feed/RowShort'
import { Topics } from '../Nav/Topics'
import { Icon } from '../_shared/Icon'
import { ArticleCardSwiper } from '../_shared/SolidSwiper/ArticleCardSwiper'

import { loadShouts } from '~/lib/api'
import { SHOUTS_PER_PAGE } from '~/routes/(home)'
import styles from './Home.module.scss'

export const RANDOM_TOPICS_COUNT = 12
export const RANDOM_TOPIC_SHOUTS_COUNT = 7
const CLIENT_LOAD_ARTICLES_COUNT = 29
const LOAD_MORE_PAGE_SIZE = 16 // Row1 + Row3 + Row2 + Beside (3 + 1) + Row1 + Row 2 + Row3

export interface HomeViewProps {
  featuredShouts: Shout[]
  topRatedShouts: Shout[]
  topMonthShouts: Shout[]
  topViewedShouts: Shout[]
  topCommentedShouts: Shout[]
}

export const HomeView = (props: HomeViewProps) => {
  const { t } = useLocalize()
  const { topAuthors } = useAuthors()
  const { topTopics, randomTopic } = useTopics()
  const [randomTopicArticles, setRandomTopicArticles] = createSignal<Shout[]>([])
  createEffect(
    on(
      () => randomTopic(),
      async (topic?: Topic) => {
        if (topic) {
          const shoutsByTopicLoader = loadShouts({
            filters: { topic: topic.slug, featured: true },
            limit: 5,
            offset: 0
          })
          const shouts = await shoutsByTopicLoader()
          setRandomTopicArticles(shouts || [])
        }
      },
      { defer: true }
    )
  )

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(
      props.featuredShouts || [],
      SHOUTS_PER_PAGE + CLIENT_LOAD_ARTICLES_COUNT,
      LOAD_MORE_PAGE_SIZE
    )
  )

  return (
    <Show when={(props.featuredShouts || []).length > 0}>
      <Topics />
      <Row5 articles={props.featuredShouts.slice(0, 5)} nodate={true} />
      <Hero />
      <Show when={props.featuredShouts?.length > SHOUTS_PER_PAGE}>
        <Beside
          beside={props.featuredShouts[5]}
          title={t('Top viewed')}
          values={props.topViewedShouts.slice(0, 5)}
          wrapper={'top-article'}
          nodate={true}
        />
        <Row3 articles={(props.featuredShouts || []).slice(6, 9)} nodate={true} />
        <Beside
          beside={props.featuredShouts[9]}
          title={t('Top authors')}
          values={topAuthors()}
          wrapper={'author'}
          nodate={true}
        />

        <ArticleCardSwiper title={t('Top month')} slides={props.topMonthShouts} />

        <Row2 articles={props.featuredShouts.slice(10, 12)} nodate={true} />
        <RowShort articles={props.featuredShouts.slice(12, 16)} />
        <Row1 article={props.featuredShouts[16]} nodate={true} />
        <Row3 articles={props.featuredShouts.slice(17, 20)} nodate={true} />
        <Row3
          articles={props.topCommentedShouts.slice(0, 3)}
          header={<h2>{t('Top commented')}</h2>}
          nodate={true}
        />
        <Show when={Boolean(randomTopic())}>
          <Group
            articles={randomTopicArticles() || []}
            header={
              <div class={styles.randomTopicHeaderContainer}>
                <div class={styles.randomTopicHeader}>{capitalize(randomTopic()?.title || '', true)}</div>
                <div>
                  <a class={styles.randomTopicHeaderLink} href={`/topic/${randomTopic()?.slug || ''}`}>
                    {t('All articles')} <Icon class={styles.icon} name="arrow-right" />
                  </a>
                </div>
              </div>
            }
          />
        </Show>

        <ArticleCardSwiper title={t('Favorite')} slides={props.topRatedShouts} />

        <Beside
          beside={props.featuredShouts[20]}
          title={t('Top topics')}
          values={topTopics().slice(0, 5)}
          wrapper={'topic'}
          isTopicCompact={true}
          nodate={true}
        />
        <Row3 articles={props.featuredShouts.slice(21, 24)} nodate={true} />
        <Banner />
        <Row2 articles={props.featuredShouts.slice(24, 26)} nodate={true} />
        <Row3 articles={props.featuredShouts.slice(26, 29)} nodate={true} />
        <Row2 articles={props.featuredShouts.slice(29, 31)} nodate={true} />
        <Row3 articles={props.featuredShouts.slice(31, 34)} nodate={true} />
      </Show>
      <For each={pages()}>
        {(page) => (
          <>
            <Row1 article={page[0]} nodate={true} />
            <Row3 articles={page.slice(1, 4)} nodate={true} />
            <Row2 articles={page.slice(4, 6)} nodate={true} />
            <Beside values={page.slice(6, 9)} beside={page[9]} wrapper="article" nodate={true} />
            <Row1 article={page[10]} nodate={true} />
            <Row2 articles={page.slice(11, 13)} nodate={true} />
            <Row3 articles={page.slice(13, 16)} nodate={true} />
          </>
        )}
      </For>
    </Show>
  )
}
