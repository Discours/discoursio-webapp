import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { setTopicsSort, useTopicsStore } from '../../stores/zine/topics'
import { useRouter } from '../../stores/router'
import { TopicCard } from '../Topic/Card'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { locale } from '../../stores/ui'
import { translit } from '../../utils/ru2en'
import styles from '../../styles/AllTopics.module.scss'
import { SearchField } from '../_shared/SearchField'

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
  const ALPHABET = [
    '#',
    'А',
    'Б',
    'В',
    'Г',
    'Д',
    'Е',
    'Ё',
    'Ж',
    'З',
    'И',
    'Й',
    'К',
    'Л',
    'М',
    'Н',
    'О',
    'П',
    'Р',
    'С',
    'Т',
    'У',
    'Ф',
    'Х',
    'Ц',
    'Ч',
    'Ш',
    'Щ',
    'Ъ',
    'Ы',
    'Ь',
    'Э',
    'Ю',
    'Я'
  ]

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
      let letter = topic.title[0].toUpperCase()
      if (!/[А-я]/i.test(letter) && locale() === 'ru') letter = '#'
      if (!acc[letter]) acc[letter] = []
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
  const [searchResults, setSearchResults] = createSignal<Topic[]>([])
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const searchTopics = (value) => {
    /* very stupid search algorithm with no deps */
    let q = value.toLowerCase()
    if (q.length > 0) {
      console.debug(q)
      setSearchResults([])

      if (locale() === 'ru') q = translit(q, 'ru')
      const ttt: Topic[] = []
      sortedTopics().forEach((topic) => {
        let flag = false
        topic.slug.split('-').forEach((w) => {
          if (w.startsWith(q)) flag = true
        })

        if (!flag) {
          let wrds: string = topic.title.toLowerCase()
          if (locale() === 'ru') wrds = translit(wrds, 'ru')
          wrds.split(' ').forEach((w: string) => {
            if (w.startsWith(q)) flag = true
          })
        }

        if (flag && !ttt.includes(topic)) ttt.push(topic)
      })

      setSearchResults((sr: Topic[]) => [...sr, ...ttt])
      changeSearchParam('by', '')
    }
  }

  const AllTopicsHead = () => (
    <div class={clsx(styles.pageHeader, 'col-lg-10 col-xl-9')}>
      <h1>{t('Topics')}</h1>
      <p>{t('Subscribe what you like to tune your personal feed')}</p>

      <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
        <li classList={{ selected: searchParams().by === 'shouts' }}>
          <a href="/topics?by=shouts">{t('By shouts')}</a>
        </li>
        <li classList={{ selected: searchParams().by === 'authors' }}>
          <a href="/topics?by=authors">{t('By authors')}</a>
        </li>
        <li classList={{ selected: searchParams().by === 'title' }}>
          <a href="/topics?by=title">{t('By alphabet')}</a>
        </li>
        <li class="view-switcher__search">
          <SearchField onChange={searchTopics} />
        </li>
      </ul>
    </div>
  )
  return (
    <div class={clsx(styles.allTopicsPage, 'wide-container')}>
      <div class="shift-content">
        <AllTopicsHead />

        <Show when={sortedTopics().length > 0 || searchResults().length > 0}>
          <Show when={searchParams().by === 'title'}>
            <div class="col-lg-10 col-xl-9">
              <ul class={clsx('nodash', styles.alphabet)}>
                <For each={ALPHABET}>
                  {(letter, index) => (
                    <li>
                      <Show when={sortedKeys().includes(letter)}>
                        <a href={`#letter-${index()}`}>{letter}</a>
                      </Show>
                      <Show when={!sortedKeys().includes(letter)}>{letter}</Show>
                    </li>
                  )}
                </For>
              </ul>
            </div>

            <For each={sortedKeys()}>
              {(letter, index) => (
                <div class={clsx(styles.group, 'group')}>
                  <h2 id={`letter-${index()}`}>{letter}</h2>
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-10">
                        <div class="row">
                          <For each={byLetter()[letter]}>
                            {(topic) => (
                              <div class={clsx(styles.topic, 'topic col-sm-6 col-md-4')}>
                                <a href={`/topic/${topic.slug}`}>{topic.title}</a>
                                <span class={styles.articlesCounter}>{topic.stat.shouts}</span>
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

          <Show when={searchResults().length > 1}>
            <For each={searchResults().slice(0, limit())}>
              {(topic) => (
                <TopicCard
                  topic={topic}
                  compact={false}
                  subscribed={subscribed(topic.slug)}
                  showPublications={true}
                />
              )}
            </For>
          </Show>

          <Show when={searchParams().by === 'authors'}>
            <For each={sortedTopics().slice(0, limit())}>
              {(topic) => (
                <TopicCard
                  topic={topic}
                  compact={false}
                  subscribed={subscribed(topic.slug)}
                  showPublications={true}
                />
              )}
            </For>
          </Show>

          <Show when={searchParams().by === 'shouts'}>
            <For each={sortedTopics().slice(0, limit())}>
              {(topic) => (
                <TopicCard
                  topic={topic}
                  compact={false}
                  subscribed={subscribed(topic.slug)}
                  showPublications={true}
                />
              )}
            </For>
          </Show>

          <Show when={sortedTopics().length > limit()}>
            <div class={clsx(styles.loadMoreContainer, 'col-12 col-md-10 offset-md-1')}>
              <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                {t('Load more')}
              </button>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  )
}
