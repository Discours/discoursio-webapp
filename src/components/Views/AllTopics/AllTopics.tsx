import { clsx } from 'clsx'
import { For, Show, createMemo, createSignal } from 'solid-js'

import { Meta } from '@solidjs/meta'
import { useSearchParams } from '@solidjs/router'
import { useLocalize } from '../../../context/localize'
import type { Topic } from '../../../graphql/schema/core.gen'
import { capitalize } from '../../../utils/capitalize'
import { dummyFilter } from '../../../utils/dummyFilter'
import { getImageUrl } from '../../../utils/getImageUrl'
import { scrollHandler } from '../../../utils/scroll'
import { TopicBadge } from '../../Topic/TopicBadge'
import { Loading } from '../../_shared/Loading'
import { SearchField } from '../../_shared/SearchField'

import styles from './AllTopics.module.scss'

type Props = {
  topics: Topic[]
}

export const TOPICS_PER_PAGE = 20
export const ABC = {
  ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ#',
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'
}

export const AllTopics = (props: Props) => {
  const { t, lang } = useLocalize()
  const alphabet = createMemo(() => ABC[lang()])
  const [searchParams] = useSearchParams<{ by?: string }>()
  const sortedTopics = createMemo(() => props.topics)

  // sorted derivative
  const byLetter = createMemo<{ [letter: string]: Topic[] }>(() => {
    return sortedTopics().reduce(
      (acc, topic) => {
        let letter = lang() === 'en' ? topic.slug[0].toUpperCase() : (topic?.title?.[0] || '').toUpperCase()
        if (/[^ËА-яё]/.test(letter) && lang() === 'ru') letter = '#'
        if (/[^A-z]/.test(letter) && lang() === 'en') letter = '#'
        if (!acc[letter]) acc[letter] = []
        acc[letter].push(topic)
        return acc
      },
      {} as { [letter: string]: Topic[] }
    )
  })

  // helper memo
  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetter())
    if (keys) {
      keys.sort()
      const firstKey: string = keys.shift() || ''
      keys.push(firstKey)
    }
    return keys
  })

  // limit/offset based pagination aka 'show more' logic
  const [limit, setLimit] = createSignal(TOPICS_PER_PAGE)
  const showMore = () => setLimit((oldLimit) => oldLimit + TOPICS_PER_PAGE)

  // filter
  const [searchQuery, setSearchQuery] = createSignal('')
  const filteredResults = createMemo(() => {
    return dummyFilter(sortedTopics(), searchQuery(), lang())
  })

  // subcomponent
  const AllTopicsHead = () => (
    <div class="row">
      <div class="col-lg-18 col-xl-15">
        <h1>{t('Topics')}</h1>
        <p>{t('Subscribe what you like to tune your personal feed')}</p>

        <ul class="view-switcher">
          <li classList={{ 'view-switcher__item--selected': searchParams?.by === 'shouts' }}>
            <a href="/topics?by=shouts">{t('By shouts')}</a>
          </li>
          <li classList={{ 'view-switcher__item--selected': searchParams?.by === 'authors' }}>
            <a href="/topics?by=authors">{t('By authors')}</a>
          </li>
          <li classList={{ 'view-switcher__item--selected': searchParams?.by === 'title' }}>
            <a href="/topics?by=title">{t('By title')}</a>
          </li>
          <Show when={searchParams?.by !== 'title'}>
            <li class="view-switcher__search">
              <SearchField onChange={(value) => setSearchQuery(value)} />
            </li>
          </Show>
        </ul>
      </div>
    </div>
  )

  // meta
  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Themes and plots')
  const description = t(
    'Thematic table of contents of the magazine. Here you can find all the topics that the community authors wrote about'
  )

  return (
    <div class={clsx(styles.allTopicsPage, 'wide-container')}>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('keywords')} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />
      <Show when={Boolean(props.topics)} fallback={<Loading />}>
        <div class="row">
          <div class="col-md-19 offset-md-5">
            <AllTopicsHead />

            <Show when={filteredResults().length > 0}>
              <Show when={searchParams?.by === 'title'}>
                <div class="col-lg-18 col-xl-15">
                  <ul class={clsx('nodash', styles.alphabet)}>
                    <For each={Array.from(alphabet())}>
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
                      <h2 id={`letter-${alphabet().indexOf(letter)}`}>{letter}</h2>
                      <div class="row">
                        <div class="col-lg-20">
                          <div class="row">
                            <For each={byLetter()[letter]}>
                              {(topic) => (
                                <div class={clsx(styles.topic, 'topic col-sm-12 col-md-8')}>
                                  <a href={`/topic/${topic.slug}`}>
                                    {lang() === 'en'
                                      ? capitalize(topic.slug.replaceAll('-', ' '))
                                      : topic.title}
                                  </a>
                                  <span class={styles.articlesCounter}>{topic.stat?.shouts || 0}</span>
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

              <Show when={searchParams?.by && searchParams?.by !== 'title'}>
                <div class="row">
                  <div class="col-lg-18 col-xl-15 py-4">
                    <For each={filteredResults().slice(0, limit())}>
                      {(topic) => (
                        <>
                          <TopicBadge topic={topic} showStat={true} />
                        </>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              <Show when={filteredResults().length > limit() && searchParams?.by !== 'title'}>
                <div class={clsx(styles.loadMoreContainer, 'col-24 col-md-20 col-lg-14 offset-md-2')}>
                  <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                    {t('Load more')}
                  </button>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
