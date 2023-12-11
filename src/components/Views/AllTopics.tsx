import type { Topic } from '../../graphql/types.gen'

import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { useRouter } from '../../stores/router'
import { setTopicsSort, useTopicsStore } from '../../stores/zine/topics'
import { dummyFilter } from '../../utils/dummyFilter'
import { getImageUrl } from '../../utils/getImageUrl'
import { scrollHandler } from '../../utils/scroll'
import { SearchField } from '../_shared/SearchField'
import { TopicCard } from '../Topic/Card'

import styles from './AllTopics.module.scss'

type AllTopicsPageSearchParams = {
  by: 'shouts' | 'authors' | 'title' | ''
}

type AllTopicsViewProps = {
  topics: Topic[]
}

const PAGE_SIZE = 20
const ALPHABET = [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ#']

export const AllTopicsView = (props: AllTopicsViewProps) => {
  const { t, lang } = useLocalize()
  const { searchParams, changeSearchParam } = useRouter<AllTopicsPageSearchParams>()
  const [limit, setLimit] = createSignal(PAGE_SIZE)

  const { sortedTopics } = useTopicsStore({
    topics: props.topics,
    sortBy: searchParams().by || 'shouts',
  })

  const { subscriptions } = useSession()

  createEffect(() => {
    if (!searchParams().by) {
      changeSearchParam({
        by: 'shouts',
      })
    }
  })

  createEffect(() => {
    setTopicsSort(searchParams().by || 'shouts')
  })

  const byLetter = createMemo<{ [letter: string]: Topic[] }>(() => {
    return sortedTopics().reduce(
      (acc, topic) => {
        let letter = topic.title[0].toUpperCase()
        if (/[^ËА-яё]/.test(letter) && lang() === 'ru') letter = '#'
        if (!acc[letter]) acc[letter] = []
        acc[letter].push(topic)
        return acc
      },
      {} as { [letter: string]: Topic[] },
    )
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetter())
    keys.sort()
    keys.push(keys.shift())
    return keys
  })

  const subscribed = (topicSlug: string) => subscriptions().topics.some((topic) => topic.slug === topicSlug)

  const showMore = () => setLimit((oldLimit) => oldLimit + PAGE_SIZE)
  const [searchQuery, setSearchQuery] = createSignal('')
  const filteredResults = createMemo(() => {
    return dummyFilter(sortedTopics(), searchQuery(), lang())
  })

  const AllTopicsHead = () => (
    <div class="row">
      <div class="col-lg-20 col-xl-18">
        <h1>{t('Topics')}</h1>
        <p>{t('Subscribe what you like to tune your personal feed')}</p>

        <ul class="view-switcher">
          <li classList={{ 'view-switcher__item--selected': searchParams().by === 'shouts' }}>
            <a href="/topics?by=shouts">{t('By shouts')}</a>
          </li>
          <li classList={{ 'view-switcher__item--selected': searchParams().by === 'authors' }}>
            <a href="/topics?by=authors">{t('By authors')}</a>
          </li>
          <li classList={{ 'view-switcher__item--selected': searchParams().by === 'title' }}>
            <a href="/topics?by=title">{t('By title')}</a>
          </li>
          <Show when={searchParams().by !== 'title'}>
            <li class="view-switcher__search">
              <SearchField onChange={(value) => setSearchQuery(value)} />
            </li>
          </Show>
        </ul>
      </div>
    </div>
  )

  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Discours – an open magazine about culture, science and society')
  const description = t(
    'Independent media project about culture, science, art and society with horizontal editing',
  )

  return (
    <div class={clsx(styles.allTopicsPage, 'wide-container')}>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('keywords')} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:desscription" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />
      <div class="row">
        <div class="col-md-19 offset-md-5">
          <AllTopicsHead />

          <Show when={filteredResults().length > 0}>
            <Show when={searchParams().by === 'title'}>
              <div class="col-lg-20 col-xl-18">
                <ul class={clsx('nodash', styles.alphabet)}>
                  <For each={ALPHABET}>
                    {(letter, index) => (
                      <li>
                        <Show when={letter in byLetter()} fallback={letter}>
                          <a
                            href={`/topics?by=title#letter-${index()}`}
                            onClick={(event) => {
                              event.preventDefault()
                              scrollHandler(`letter-${index()}`)
                            }}
                          >
                            {letter}
                          </a>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              </div>

              <For each={sortedKeys()}>
                {(letter) => (
                  <div class={clsx(styles.group, 'group')}>
                    <h2 id={`letter-${ALPHABET.indexOf(letter)}`}>{letter}</h2>
                    <div class="row">
                      <div class="col-lg-20">
                        <div class="row">
                          <For each={byLetter()[letter]}>
                            {(topic) => (
                              <div class={clsx(styles.topic, 'topic col-sm-12 col-md-8')}>
                                <a href={`/topic/${topic.slug}`}>{topic.title}</a>
                                <span class={styles.articlesCounter}>{topic.stat.shouts}</span>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </Show>

            <Show when={searchParams().by && searchParams().by !== 'title'}>
              <div class="row">
                <div class="col-lg-20 col-xl-18">
                  <For each={filteredResults().slice(0, limit())}>
                    {(topic) => (
                      <>
                        <TopicCard
                          topic={topic as Topic}
                          compact={false}
                          subscribed={subscribed(topic.slug)}
                          showPublications={true}
                          showDescription={true}
                        />
                        <div class={styles.stats}>
                          <span class={styles.statsItem}>
                            {t('shoutsWithCount', { count: topic.stat.shouts })}
                          </span>
                          <span class={styles.statsItem}>
                            {t('authorsWithCount', { count: topic.stat.authors })}
                          </span>
                          <span class={styles.statsItem}>
                            {t('followersWithCount', { count: topic.stat.followers })}
                          </span>
                        </div>
                      </>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={filteredResults().length > limit() && searchParams().by !== 'title'}>
              <div class={clsx(styles.loadMoreContainer, 'col-24 col-md-20 col-lg-14 offset-md-2')}>
                <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                  {t('Load more')}
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  )
}
