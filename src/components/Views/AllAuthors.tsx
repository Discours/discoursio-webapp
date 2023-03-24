import { createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'

import { setAuthorsSort, useAuthorsStore } from '../../stores/zine/authors'
import { useRouter } from '../../stores/router'
import { AuthorCard } from '../Author/Card'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { translit } from '../../utils/ru2en'
import styles from '../../styles/AllTopics.module.scss'
import { SearchField } from '../_shared/SearchField'
import { scrollHandler } from '../../utils/scroll'
import { useLocalize } from '../../context/localize'

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'followers'
}

type AllAuthorsViewProps = {
  authors: Author[]
}

const PAGE_SIZE = 20
const ALPHABET = [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ@']

export const AllAuthorsView = (props: AllAuthorsViewProps) => {
  const { t, lang } = useLocalize()
  const [limit, setLimit] = createSignal(PAGE_SIZE)
  const { searchParams, changeSearchParam } = useRouter<AllAuthorsPageSearchParams>()
  const { sortedAuthors } = useAuthorsStore({
    authors: props.authors,
    sortBy: searchParams().by || 'shouts'
  })

  const [searchQuery, setSearchQuery] = createSignal('')

  const { session } = useSession()

  onMount(() => {
    if (!searchParams().by) {
      changeSearchParam('by', 'shouts')
    }
  })

  createEffect(() => {
    setAuthorsSort(searchParams().by || 'shouts')
  })

  const byLetter = createMemo<{ [letter: string]: Author[] }>(() => {
    return sortedAuthors().reduce((acc, author) => {
      let letter = author.name.trim().split(' ').pop().at(0).toUpperCase()

      if (/[^ËА-яё]/.test(letter) && lang() === 'ru') letter = '@'

      if (!acc[letter]) acc[letter] = []

      acc[letter].push(author)
      return acc
    }, {} as { [letter: string]: Author[] })
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetter())
    keys.sort()
    keys.push(keys.shift())
    return keys
  })

  const subscribed = (s) => Boolean(session()?.news?.authors && session()?.news?.authors?.includes(s || ''))

  const filteredAuthors = createMemo(() => {
    let q = searchQuery().toLowerCase()

    if (q.length === 0) {
      return sortedAuthors()
    }

    if (lang() === 'ru') q = translit(q)

    return sortedAuthors().filter((author) => {
      if (author.slug.split('-').some((w) => w.startsWith(q))) {
        return true
      }

      let name = author.name.toLowerCase()
      if (lang() === 'ru') {
        name = translit(name)
      }

      return name.split(' ').some((word) => word.startsWith(q))
    })
  })

  const showMore = () => setLimit((oldLimit) => oldLimit + PAGE_SIZE)
  const AllAuthorsHead = () => (
    <div class="row">
      <div class={clsx('col-lg-20 col-xl-18')}>
        <h1>{t('Authors')}</h1>
        <p>{t('Subscribe who you like to tune your personal feed')}</p>

        <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
          <li classList={{ selected: !searchParams().by || searchParams().by === 'shouts' }}>
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
              <SearchField onChange={(value) => setSearchQuery(value)} />
            </li>
          </Show>
        </ul>
      </div>
    </div>
  )

  return (
    <div class={clsx(styles.allTopicsPage, 'wide-container')}>
      <Show when={sortedAuthors().length > 0}>
        <div class="offset-md-5">
          <AllAuthorsHead />

          <Show when={searchParams().by === 'name'}>
            <div class="row">
              <div class="col-lg-20 col-xl-18">
                <ul class={clsx('nodash', styles.alphabet)}>
                  <For each={ALPHABET}>
                    {(letter, index) => (
                      <li>
                        <Show when={letter in byLetter()} fallback={letter}>
                          <a
                            href={`/authors?by=name#letter-${index()}`}
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
            </div>

            <For each={sortedKeys()}>
              {(letter) => (
                <div class={clsx(styles.group, 'group')}>
                  <h2 id={`letter-${ALPHABET.indexOf(letter)}`}>{letter}</h2>
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-20">
                        <div class="row">
                          <For each={byLetter()[letter]}>
                            {(author) => (
                              <div class={clsx(styles.topic, 'topic col-sm-12 col-md-8')}>
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

          <Show when={searchParams().by && searchParams().by !== 'name'}>
            <For each={filteredAuthors().slice(0, limit())}>
              {(author) => (
                <div class="row">
                  <div class="col-lg-20 col-xl-18">
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

          <Show when={filteredAuthors().length > limit() && searchParams().by !== 'name'}>
            <div class="row">
              <div class={clsx(styles.loadMoreContainer, 'col-24 col-md-20')}>
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
