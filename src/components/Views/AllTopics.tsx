import { createEffect, For, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { Icon } from '../Nav/Icon'
import { t } from '../../utils/intl'
import { setSortAllTopicsBy, useTopicsStore } from '../../stores/zine/topics'
import { handleClientRouteLinkClick, useRouter } from '../../stores/router'
import { TopicCard } from '../Topic/Card'
import { session } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import '../../styles/AllTopics.scss'

type AllTopicsPageSearchParams = {
  by: 'shouts' | 'authors' | 'title' | ''
}

type Props = {
  topics: Topic[]
}

export const AllTopicsView = (props: Props) => {
  const { getSearchParams, changeSearchParam } = useRouter<AllTopicsPageSearchParams>()

  const { getSortedTopics } = useTopicsStore({
    topics: props.topics,
    sortBy: getSearchParams().by || 'shouts'
  })
  const auth = useStore(session)

  createEffect(() => {
    setSortAllTopicsBy(getSearchParams().by || 'shouts')
  })

  const subscribed = (s) => Boolean(auth()?.info?.topics && auth()?.info?.topics?.includes(s || ''))

  return (
    <div class="all-topics-page">
      <Show when={getSortedTopics().length > 0}>
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
                  <li classList={{ selected: getSearchParams().by === 'shouts' || !getSearchParams().by }}>
                    <a href="/topics?by=shouts" onClick={handleClientRouteLinkClick}>
                      {t('By shouts')}
                    </a>
                  </li>
                  <li classList={{ selected: getSearchParams().by === 'authors' }}>
                    <a href="/topics?by=authors" onClick={handleClientRouteLinkClick}>
                      {t('By authors')}
                    </a>
                  </li>
                  <li classList={{ selected: getSearchParams().by === 'title' }}>
                    <a
                      href="/topics?by=title"
                      onClick={(ev) => {
                        // just an example
                        ev.preventDefault()
                        changeSearchParam('by', 'title')
                      }}
                    >
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

                <div class="stats">
                  <For each={getSortedTopics()}>
                    {(topic) => (
                      <TopicCard topic={topic} compact={false} subscribed={subscribed(topic.slug)} />
                    )}
                  </For>
                </div>

                {/*FIXME*/}
                {/*<Show*/}
                {/*  when={params()['by'] === 'abc'}*/}
                {/*  fallback={() => (*/}
                {/*    <div class="stats">*/}
                {/*      <For each={getSortedTopics()}>*/}
                {/*        {(topic: Topic) => (*/}
                {/*          <TopicCard topic={topic} compact={false} subscribed={subscribed(topic.slug)} />*/}
                {/*        )}*/}
                {/*      </For>*/}
                {/*    </div>*/}
                {/*  )}*/}
                {/*>*/}
                {/*  <For each={sortedKeys() || []}>*/}
                {/*    {(letter: string) => (*/}
                {/*      <div class="group">*/}
                {/*        <h2>{letter}</h2>*/}
                {/*        <div class="container">*/}
                {/*          <div class="row">*/}
                {/*            <For each={abc()[letter]}>*/}
                {/*              {(topic: Partial<Topic>) => (*/}
                {/*                <div class="topic col-sm-6 col-md-3">*/}
                {/*                  <div class="topic-title">*/}
                {/*                    <a href={`/topic/${topic.slug}`}>{topic.title}</a>*/}
                {/*                  </div>*/}
                {/*                </div>*/}
                {/*              )}*/}
                {/*            </For>*/}
                {/*          </div>*/}
                {/*        </div>*/}
                {/*      </div>*/}
                {/*    )}*/}
                {/*  </For>*/}
                {/*</Show>*/}
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
