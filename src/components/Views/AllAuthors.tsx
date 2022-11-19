import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { Icon } from '../_shared/Icon'
import { t } from '../../utils/intl'
import { useAuthorsStore, setAuthorsSort } from '../../stores/zine/authors'
import { useRouter } from '../../stores/router'
import styles from '../../styles/AllTopics.module.scss'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { locale } from '../../stores/ui'
import { translit } from '../../utils/ru2en'
import { SearchField } from '../_shared/SearchField'
import { scrollHandler } from '../../utils/scroll'

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'rating'
}

type Props = {
  authors: Author[]
}

const PAGE_SIZE = 20
const ALPHABET = [...'@АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ']

export const AllAuthorsView = (props: Props) => {
  const { sortedAuthors } = useAuthorsStore({ authors: props.authors })
  const [limit, setLimit] = createSignal(PAGE_SIZE)

  const { session } = useSession()

  createEffect(() => {
    setAuthorsSort(searchParams().by || 'shouts')
  })

  const subscribed = (s) => Boolean(session()?.news?.authors && session()?.news?.authors?.includes(s || ''))

  const { searchParams, changeSearchParam } = useRouter<AllAuthorsPageSearchParams>()

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
          <li classList={{ selected: searchParams().by === 'rating' }}>
            <a href="/authors?by=rating">{t('By rating')}</a>
          </li>
          <li classList={{ selected: !searchParams().by || searchParams().by === 'name' }}>
            <a href="/authors?by=name">{t('By name')}</a>
          </li>
          <li class="view-switcher__search">
            <SearchField onChange={searchAuthors} />
          </li>
        </ul>
      </div>
    </div>
  )
  const [searchResults, setSearchResults] = createSignal<Author[]>([])
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const searchAuthors = (value) => {
    /* very stupid search algorithm with no deps */
    let q = value.toLowerCase()
    if (q.length > 0) {
      console.debug(q)
      setSearchResults([])

      if (locale() === 'ru') q = translit(q, 'ru')
      const aaa: Author[] = []
      sortedAuthors().forEach((a) => {
        let flag = false
        a.slug.split('-').forEach((w) => {
          if (w.startsWith(q)) flag = true
        })

        if (!flag) {
          let wrds: string = a.name.toLowerCase()
          if (locale() === 'ru') wrds = translit(wrds, 'ru')
          wrds.split(' ').forEach((w: string) => {
            if (w.startsWith(q)) flag = true
          })
        }

        if (flag && !aaa.includes(a)) aaa.push(a)
      })

      setSearchResults((sr: Author[]) => [...sr, ...aaa])
      changeSearchParam('by', '')
    }
  }
  return (
    <div class={clsx(styles.allTopicsPage, 'container')}>
      <Show when={sortedAuthors().length > 0 || searchResults().length > 0}>
        <div class="shift-content">
          <AllAuthorsHead />

          <Show when={searchParams().by === 'name'}>
            <div class="row">
              <div class="col-lg-10 col-xl-9">
                <ul class={clsx('nodash', styles.alphabet)}>
                  <For each={ALPHABET}>
                    {(letter: string, index) => (
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
                                  <sup>{author.stat.shouts}</sup>
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

          <div class={styles.stats}>
            <Show when={searchResults().length > 0}>
              <For each={searchResults().slice(0, limit())}>
                {(author) => (
                  <AuthorCard
                    author={author}
                    compact={false}
                    hasLink={true}
                    subscribed={subscribed(author.slug)}
                    noSocialButtons={true}
                    isAuthorsList={true}
                    truncateBio={true}
                  />
                )}
              </For>
            </Show>

            <Show when={searchParams().by && searchParams().by !== 'name'}>
              <div class="row">
                <div class="col-lg-10 col-xl-9">
                  <For each={sortedAuthors().slice(0, limit())}>
                    {(author) => (
                      <AuthorCard
                        author={author}
                        compact={false}
                        hasLink={true}
                        subscribed={subscribed(author.slug)}
                        noSocialButtons={true}
                        isAuthorsList={true}
                        truncateBio={true}
                      />
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={sortedAuthors().length > limit()}>
              <div class="row">
                <div class={clsx(styles.loadMoreContainer, 'col-12 col-md-10')}>
                  <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                    {t('Load more')}
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
