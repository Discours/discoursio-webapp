import { createEffect, createSignal, For, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { byFirstChar, sortBy } from '../../utils/sortby'
import Icon from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useTopicsStore } from '../../stores/zine/topics'
import { params as paramstore, route } from '../../stores/router'
import { TopicCard } from '../Topic/Card'
import { session } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import { groupByTitle } from '../../utils/groupby'
import '../../styles/AllTopics.scss'

export const AllTopicsPage = (props: { topics?: Topic[] }) => {
  const [sortedTopics, setSortedTopics] = createSignal<Partial<Topic>[]>([])
  const [sortedKeys, setSortedKeys] = createSignal<string[]>()
  const [abc, setAbc] = createSignal([])
  const { getSortedTopics: topicslist } = useTopicsStore({ topics: props.topics || [] })
  const auth = useStore(session)
  const subscribed = (s) => Boolean(auth()?.info?.topics && auth()?.info?.topics?.includes(s || ''))
  const params = useStore(paramstore)
  createEffect(() => {
    if (abc().length === 0 && (!params()['by'] || params()['by'] === 'abc')) {
      console.log('[topics] default grouping by abc')
      const grouped = { ...groupByTitle(topicslist()) }
      grouped['A-Z'] = sortBy(grouped['A-Z'], byFirstChar)
      setAbc(grouped)
      const keys = Object.keys(abc)
      keys.sort()
      setSortedKeys(keys as string[])
    } else {
      console.log('[topics] sorting by ' + params()['by'])
      setSortedTopics(sortBy(topicslist(), params()['by']))
    }
  }, [topicslist(), params()])

  return (
    <>
      <div class="all-topics-page">
        <Show when={Boolean(sortedTopics()?.length)}>
          <div class="wide-container">
            <div class="shift-content">
              <div class="row">
                <div class="col-md-9 page-header">
                  <h1>{t('Topics')}</h1>
                  <p>{t('Subscribe what you like to tune your personal feed')}</p>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <ul class="view-switcher">
                    <li classList={{ selected: params()['by'] === 'shouts' }}>
                      <a href="/topics?by=shouts" onClick={route}>
                        {t('By shouts')}
                      </a>
                    </li>
                    <li classList={{ selected: params()['by'] === 'authors' }}>
                      <a href="/topics?by=authors" onClick={route}>
                        {t('By authors')}
                      </a>
                    </li>
                    <li classList={{ selected: params()['by'] === 'abc' }}>
                      <a href="/topics" onClick={route}>
                        {t('By alphabet')}
                      </a>
                    </li>
                    <li class="view-switcher__search">
                      <a href="/topic/search">
                        <Icon name="search" />
                        {t('Search topic')}
                      </a>
                    </li>
                  </ul>

                  <Show
                    when={params()['by'] === 'abc'}
                    fallback={() => (
                      <div class="stats">
                        <For each={sortedTopics()}>
                          {(topic: Topic) => (
                            <TopicCard topic={topic} compact={false} subscribed={subscribed(topic.slug)} />
                          )}
                        </For>
                      </div>
                    )}
                  >
                    <For each={sortedKeys() || []}>
                      {(letter: string) => (
                        <div class="group">
                          <h2>{letter}</h2>
                          <div class="container">
                            <div class="row">
                              <For each={abc()[letter]}>
                                {(topic: Partial<Topic>) => (
                                  <div class="topic col-sm-6 col-md-3">
                                    <div class="topic-title">
                                      <a href={`/topic/${topic.slug}`}>{topic.title}</a>
                                    </div>
                                  </div>
                                )}
                              </For>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </>
  )
}
