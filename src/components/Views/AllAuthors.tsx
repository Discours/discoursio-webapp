import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { AuthorsSortBy, setAuthorsSort, useAuthorsStore } from '../../stores/zine/authors'
import { useRouter } from '../../stores/router'
import { AuthorCard } from '../Author/Card'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { locale } from '../../stores/ui'
import { translit } from '../../utils/ru2en'
import styles from '../../styles/AllTopics.module.scss'
import { SearchField } from '../_shared/SearchField'
import { scrollHandler } from '../../utils/scroll'
import { StatMetrics } from '../_shared/StatMetrics'

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'followers'
}

type AllAuthorsViewProps = {
  authors: Author[]
}

const PAGE_SIZE = 20
const ALPHABET = [...'@АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ']

export const AllAuthorsView = (props: AllAuthorsViewProps) => {
  const [limit, setLimit] = createSignal(PAGE_SIZE)
  const { searchParams, changeSearchParam } = useRouter()
  const [filterResults, setFilterResults] = createSignal<Author[]>([])
  const { sortedAuthors } = useAuthorsStore({
    authors: props.authors,
    sortBy: (searchParams().by || 'shouts') as AuthorsSortBy
  })

  const { session } = useSession()

  onMount(() => {
    if (!searchParams().by) {
      setAuthorsSort('name')
      changeSearchParam('by', 'name')
    }
  })
  createEffect(() => {
    setAuthorsSort((searchParams().by || 'shouts') as AuthorsSortBy)
    setFilterResults(sortedAuthors())
    setLimit(PAGE_SIZE)
  })

  const byLetter = createMemo<{ [letter: string]: Author[] }>(() => {
    return sortedAuthors().reduce((acc, author) => {
      let letter = author.name.trim().split(' ').pop().at(0).toUpperCase()
      if (!/[А-я]/i.test(letter) && locale() === 'ru') letter = '@'
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(author)
      return acc
    }, {} as { [letter: string]: Author[] })
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetter())
    keys.sort()
    return keys
  })

  const subscribed = (s) => Boolean(session()?.news?.authors && session()?.news?.authors?.includes(s || ''))

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const filterAuthors = (value) => {
    /* very stupid filter by string algorithm with no deps */
    let q = value.toLowerCase()
    if (q.length > 0) {
      setFilterResults([])
      if (locale() === 'ru') q = translit(q, 'ru')
      const aaa: Author[] = sortedAuthors()
      sortedAuthors().forEach((author) => {
        let flag = false
        author.slug.split('-').forEach((w) => {
          if (w.startsWith(q)) flag = true
        })

        if (!flag) {
          let wrds: string = author.name.toLowerCase()
          if (locale() === 'ru') wrds = translit(wrds, 'ru')
          wrds.split(' ').forEach((w: string) => {
            if (w.startsWith(q)) flag = true
          })
        }

        if (!flag && aaa.includes(author)) {
          const idx = aaa.indexOf(author)
          aaa.splice(idx, 1)
        }
      })
      setFilterResults(aaa)
    }
  }

  const showMore = () => setLimit((oldLimit) => oldLimit + PAGE_SIZE)
  const AllAuthorsHead = () => (
    <div class="row">
      <div class={clsx(styles.pageHeader, 'col-lg-10 col-xl-9')}>
        <h1>{t('Authors')}</h1>
        <p>{t('Subscribe who you like to tune your personal feed')}</p>

        <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
          <li classList={{ selected: searchParams().by === 'shouts' }}>
            <a href="/authors?by=shouts">{t('By shouts')}</a>
          </li>
          <li classList={{ selected: searchParams().by === 'followers' }}>
            <a href="/authors?by=followers">{t('By popularity')}</a>
          </li>
          <li classList={{ selected: searchParams().by === 'name' }}>
            <a href="/authors?by=name">{t('By name')}</a>
          </li>
          <Show when={searchParams().by !== 'name'}>
            <li class="view-switcher__search">
              <SearchField onChange={filterAuthors} />
            </li>
          </Show>
        </ul>
      </div>
    </div>
  )

  return (
    <div class={clsx(styles.allTopicsPage, 'wide-container')}>
      <Show when={sortedAuthors().length > 0}>
        <div class="shift-content">
          <AllAuthorsHead />

          <Show when={searchParams().by === 'name'}>
            <div class="row">
              <div class="col-lg-10 col-xl-9">
                <ul class={clsx('nodash', styles.alphabet)}>
                  <For each={ALPHABET}>
                    {(letter, index) => (
                      <li>
                        <Show when={letter in byLetter()} fallback={letter}>
                          <a
                            href={`/authors?by=name#letter-${index()}`}
                            onClick={() => scrollHandler(`letter-${index()}`)}
                          >
                            {letter}
                          </a>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
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
                            {(author) => (
                              <div class={clsx(styles.topic, 'topic col-sm-6 col-md-4')}>
                                <div class="topic-title">
                                  <a href={`/author/${author.slug}`}>{author.name}</a>
                                  <span class={styles.articlesCounter}>{author.stat.shouts}</span>
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

          <Show when={searchParams().by && searchParams().by !== 'title'}>
            <For each={filterResults().slice(0, limit())}>
              {(author) => (
                <div class="row">
                  <div class="col-lg-10 col-xl-9">
                    <AuthorCard
                      author={author}
                      hasLink={true}
                      subscribed={subscribed(author.slug)}
                      noSocialButtons={true}
                      isAuthorsList={true}
                      truncateBio={true}
                    />
                  </div>
                </div>
              )}
            </For>
          </Show>

          <Show when={sortedAuthors().length > limit() && searchParams().by !== 'name'}>
            <div class="row">
              <div class={clsx(styles.loadMoreContainer, 'col-12 col-md-10')}>
                <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                  {t('Load more')}
                </button>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
