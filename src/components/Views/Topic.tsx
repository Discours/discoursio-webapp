import { For, Show, createMemo } from 'solid-js'
import type { Shout, Topic } from '../../graphql/types.gen'
import Row3 from '../Feed/Row3'
import Row2 from '../Feed/Row2'
import Beside from '../Feed/Beside'
import { ArticleCard } from '../Feed/Card'
import '../../styles/Topic.scss'
import { FullTopic } from '../Topic/Full'
import { t } from '../../utils/intl'
import { by, setBy } from '../../stores/router'
import { useTopicsStore } from '../../stores/zine/topics'
import { useArticlesStore } from '../../stores/zine/articles'

interface TopicProps {
  topic: Topic
  topicArticles: Shout[]
}

export const TopicPage = (props: TopicProps) => {
  const { getAuthorsByTopic } = useTopicsStore({ topics: [props.topic] })
  const { getSortedArticles: sortedArticles } = useArticlesStore({ sortedArticles: props.topicArticles })
  const topic = createMemo(() => props.topic)
  /*
  const slug = createMemo<string>(() => {
    let slug = props?.slug
    if (props?.slug.startsWith('@')) slug = slug.replace('@', '')
    return slug
  })
  */

  const title = createMemo(() => {
    // const m = by()
    // if (m === 'viewed') return t('Top viewed')
    // if (m === 'rating') return t('Top rated')
    // if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })

  return (
    <div class="topic-page container">
      <Show when={topic()}>
        <FullTopic topic={topic()} />
        <div class="row group__controls">
          <div class="col-md-8">
            <ul class="view-switcher">
              <li classList={{ selected: !by() }}>
                <button type="button" onClick={() => setBy('recent')}>
                  {t('Recent')}
                </button>
              </li>
              <li classList={{ selected: by() === 'rating' }}>
                <button type="button" onClick={() => setBy('rating')}>
                  {t('Popular')}
                </button>
              </li>
              <li classList={{ selected: by() === 'viewed' }}>
                <button type="button" onClick={() => setBy('viewed')}>
                  {t('Views')}
                </button>
              </li>
              <li classList={{ selected: by() === 'commented' }}>
                <button type="button" onClick={() => setBy('commented')}>
                  {t('Discussing')}
                </button>
              </li>
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
                {(a: Shout) => (
                  <div class="col-md-6">
                    <ArticleCard article={a} />
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
              values={getAuthorsByTopic() as any}
              beside={sortedArticles()[6]}
              wrapper={'author'}
            />
            <Row3 articles={sortedArticles().slice(6, 9)} />
            <Row2 articles={sortedArticles().slice(9, 11)} />
            <Row3 articles={sortedArticles().slice(11, 14)} />
            <Row3 articles={sortedArticles().slice(14, 17)} />
            <Row3 articles={sortedArticles().slice(17, 20)} />
          </Show>
        </div>
      </Show>
    </div>
  )
}
