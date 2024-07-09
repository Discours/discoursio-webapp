import { A, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { SearchField } from '~/components/_shared/SearchField'
import { useLocalize } from '~/context/localize'
import { useTopics } from '~/context/topics'
import type { Topic } from '~/graphql/schema/core.gen'
import { dummyFilter } from '~/lib/dummyFilter'
import { scrollHandler } from '~/utils/scroll'
import { TopicBadge } from '../../Topic/TopicBadge'
import styles from './AllTopics.module.scss'

type Props = {
  topics: Topic[]
}

export const TOPICS_PER_PAGE = 50
export const ABC = {
  ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ#',
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'
}

export const AllTopics = (props: Props) => {
  const { t, lang } = useLocalize()
  const alphabet = createMemo(() => ABC[lang()])
  const { setTopicsSort, sortedTopics } = useTopics()
  const topics = createMemo(() => sortedTopics() || props.topics)
  const [searchParams, changeSearchParams] = useSearchParams<{ by?: string }>()
  createEffect(on(() => searchParams?.by || 'shouts', setTopicsSort, { defer: true }))
  onMount(() => !searchParams?.by && changeSearchParams({ by: 'shouts' }))

  // sorted derivative
  const byLetter = createMemo<{ [letter: string]: Topic[] }>(() => {
    return topics().reduce(
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

  // filter
  const [searchQuery, setSearchQuery] = createSignal('')
  const [filteredResults, setFilteredResults] = createSignal<Topic[]>([])
  createEffect(() =>
    setFilteredResults((_prev: Topic[]) => dummyFilter(topics(), searchQuery(), lang()) as Topic[])
  )

  // subcomponent
  const AllTopicsHead = () => (
    <div class="row">
      <div class="col-lg-18 col-xl-15">
        <h1>{t('Topics')}</h1>
        <p>{t('Subscribe what you like to tune your personal feed')}</p>

        <ul class="view-switcher">
          <li classList={{ 'view-switcher__item--selected': searchParams?.by === 'shouts' }}>
            <A href="/topic?by=shouts">{t('By shouts')}</A>
          </li>
          <li classList={{ 'view-switcher__item--selected': searchParams?.by === 'authors' }}>
            <A href="/topic?by=authors">{t('By authors')}</A>
          </li>
          <li classList={{ 'view-switcher__item--selected': searchParams?.by === 'title' }}>
            <A href="/topic?by=title">{t('By title')}</A>
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
  const AllTopicAlphabeticallyHead = () => (
    <div class="col-lg-20 col-xl-18">
      <ul class={clsx('nodash', styles.alphabet)}>
        <For each={[...alphabet()]}>
          {(letter, index) => (
            <li>
              <Show when={letter in byLetter()} fallback={letter}>
                <a
                  href={`/topic?by=title#letter-${index()}`}
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
  )
  const AllTopicAlphabetically = () => (
    <For each={sortedKeys()}>
      {(letter) => (
        <div class={clsx(styles.group, 'group')}>
          <h2 id={`letter-${alphabet().indexOf(letter)}`}>{letter}</h2>
          <div class="row">
            <div class="col-lg-20">
              <div class="row">
                <For each={byLetter()[letter]}>
                  {(topic) => (
                    <div class={clsx(styles.topicTitle, 'col-sm-12 col-md-8')}>
                      <A href={`/topic/${topic.slug}`}>{topic.title || topic.slug}</A>
                      <Show when={topic.stat?.shouts || 0}>
                        <span class={styles.articlesCounter}>{topic.stat?.shouts || 0}</span>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      )}
    </For>
  )
  return (
    <>
      <Show when={Boolean(filteredResults())} fallback={<Loading />}>
        <div class="row">
          <div class="col-md-19 offset-md-5">
            <AllTopicsHead />

            <Show when={filteredResults().length > 0}>
              <Show when={searchParams?.by === 'title'}>
                <AllTopicAlphabeticallyHead />
                <AllTopicAlphabetically />
              </Show>

              <Show when={searchParams?.by && searchParams?.by !== 'title'}>
                <div class="row">
                  <div class="col-lg-18 col-xl-15 py-4">
                    <For each={filteredResults()}>
                      {(topic) => <TopicBadge topic={topic} showStat={true} />}
                    </For>
                  </div>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </Show>
    </>
  )
}
