import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import { t } from '../../utils/intl'
import { setTopicsSort, useTopicsStore } from '../../stores/zine/topics'
import { handleClientRouteLinkClick, useRouter } from '../../stores/router'
import { TopicCard } from '../Topic/Card'
import styles from '../../styles/AllTopics.module.scss'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'

type AllTopicsPageSearchParams = {
  by: 'shouts' | 'authors' | 'title' | ''
}

type AllTopicsViewProps = {
  topics: Topic[]
}

const PAGE_SIZE = 20

export const AllTopicsView = (props: AllTopicsViewProps) => {
  const { searchParams, changeSearchParam } = useRouter<AllTopicsPageSearchParams>()
  const [limit, setLimit] = createSignal(PAGE_SIZE)

  const { sortedTopics } = useTopicsStore({
    topics: props.topics,
    sortBy: searchParams().by || 'shouts'
  })

  const { session } = useSession()

  createEffect(() => {
    setTopicsSort(searchParams().by || 'shouts')
    setLimit(PAGE_SIZE)
  })

  const byLetter = createMemo<{ [letter: string]: Topic[] }>(() => {
    return sortedTopics().reduce((acc, topic) => {
      const letter = topic.title[0].toUpperCase()
      if (!acc[letter]) {
        acc[letter] = []
      }

      acc[letter].push(topic)

      return acc
    }, {} as { [letter: string]: Topic[] })
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetter())
    keys.sort()
    return keys
  })

  const subscribed = (s) => Boolean(session()?.news?.topics && session()?.news?.topics?.includes(s || ''))

  const showMore = () => setLimit((oldLimit) => oldLimit + PAGE_SIZE)

  return (
    <div class={clsx(styles.allTopicsPage, 'container')}>
      <Show when={sortedTopics().length > 0}>
        <div class="shift-content">
          <div class="row">
            <div class={clsx(styles.pageHeader, 'col-lg-10 col-xl-9')}>
              <h1>{t('Topics')}</h1>
              <p>{t('Subscribe what you like to tune your personal feed')}</p>

              <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
                <li classList={{ selected: searchParams().by === 'shouts' || !searchParams().by }}>
                  <a href="/topics?by=shouts" onClick={handleClientRouteLinkClick}>
                    {t('By shouts')}
                  </a>
                </li>
                <li classList={{ selected: searchParams().by === 'authors' }}>
                  <a href="/topics?by=authors" onClick={handleClientRouteLinkClick}>
                    {t('By authors')}
                  </a>
                </li>
                <li classList={{ selected: searchParams().by === 'title' }}>
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
            </div>
          </div>

          <Show
            when={searchParams().by === 'title'}
            fallback={() => (
              <>
                <For each={sortedTopics().slice(0, limit())}>
                  {(topic) => (
                    <TopicCard topic={topic} compact={false} subscribed={subscribed(topic.slug)} />
                  )}
                </For>
                <Show when={sortedTopics().length > limit()}>
                  <div class="row">
                    <div class={clsx(styles.loadMoreContainer, 'col-12 col-md-10')}>
                      <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                        {t('More')}
                      </button>
                    </div>
                  </div>
                </Show>
              </>
            )}
          >
            <For each={sortedKeys()}>
              {(letter) => (
                <div class={clsx(styles.group, 'group')}>
                  <h2>{letter}</h2>
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-10">
                        <div class="row">
                          <For each={byLetter()[letter]}>
                            {(topic) => (
                              <div class={clsx(styles.topic, 'topic col-sm-6 col-md-4')}>
                                <div class="topic-title">
                                  <a href={`/topic/${topic.slug}`}>{topic.title}</a>
                                </div>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  )
}
