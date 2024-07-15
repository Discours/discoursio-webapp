import { useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
import { AuthorBadge } from '~/components/Author/AuthorBadge'
import { InlineLoader } from '~/components/InlineLoader'
import { Button } from '~/components/_shared/Button'
import { Loading } from '~/components/_shared/Loading'
import { SearchField } from '~/components/_shared/SearchField'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import type { Author } from '~/graphql/schema/core.gen'
import { authorLetterReduce, translateAuthor } from '~/intl/translate'
import { dummyFilter } from '~/lib/dummyFilter'
import { byFirstChar, byStat } from '~/lib/sort'
import { scrollHandler } from '~/utils/scroll'
import styles from './AllAuthors.module.scss'
import stylesAuthorList from './AuthorsList.module.scss'

type Props = {
  authors: Author[]
  authorsByFollowers?: Author[]
  authorsByShouts?: Author[]
  isLoaded: boolean
}

export const AUTHORS_PER_PAGE = 20
export const ABC = {
  ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ#',
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'
}

export const AllAuthors = (props: Props) => {
  const { t, lang } = useLocalize()
  const alphabet = createMemo(() => ABC[lang()] || ABC['ru'])
  const [searchParams, changeSearchParams] = useSearchParams<{ by?: string }>()
  const { authorsSorted, setAuthorsSort, loadAuthors } = useAuthors()
  const [loading, setLoading] = createSignal<boolean>(false)
  const [_currentAuthors, setCurrentAuthors] = createSignal<Author[]>([])

  // UPDATE Fetch authors initially and when searchParams.by changes
  createEffect(() => {
    fetchAuthors(searchParams.by || 'name', 0)
  })

  const authors = createMemo(() => {
    let sortedAuthors = [...(props.authors || authorsSorted())] // Clone the array to avoid mutating the original
    console.log('Before Sorting:', sortedAuthors.slice(0, 5)) // Log the first 5 authors for comparison
    if (searchParams.by === 'name') {
      sortedAuthors = sortedAuthors.sort(byFirstChar)
      console.log('Sorted by Name:', sortedAuthors.slice(0, 5))
    } else if (searchParams.by === 'shouts') {
      sortedAuthors = sortedAuthors.sort(byStat('shouts'))
      console.log('Sorted by Shouts:', sortedAuthors.slice(0, 5))
    } else if (searchParams.by === 'followers') {
      sortedAuthors = sortedAuthors.sort(byStat('followers'))
      console.log('Sorted by Followers:', sortedAuthors.slice(0, 5))
    }
    console.log('After Sorting:', sortedAuthors.slice(0, 5))
    return sortedAuthors
  })

  // Log authors data and searchParams for debugging
  createEffect(() => {
    console.log('Authors:', props.authors.slice(0, 5)) // Log the first 5 authors
    console.log('Sorted Authors:', authors().slice(0, 5)) // Log the first 5 sorted authors
    console.log('Search Params "by":', searchParams.by)
  })

  // filter
  const [searchQuery, setSearchQuery] = createSignal('')
  const [filteredAuthors, setFilteredAuthors] = createSignal<Author[]>([])
  createEffect(
    () => authors() && setFilteredAuthors(dummyFilter(authors(), searchQuery(), lang()) as Author[])
  )

  // store by first char
  const byLetterFiltered = createMemo<{ [letter: string]: Author[] }>(() => {
    if (!(filteredAuthors()?.length > 0)) return {}
    console.debug('[components.AllAuthors] update byLetterFiltered', filteredAuthors()?.length)
    return filteredAuthors().reduce(
      (acc, author: Author) => authorLetterReduce(acc, author, lang()),
      {} as { [letter: string]: Author[] }
    )
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetterFiltered() || {})
    keys.sort()
    const fk = keys.shift() || ''
    fk && keys.push(fk)
    return keys
  })

  const fetchAuthors = async (queryType: string, page: number) => {
    try {
      console.debug('[components.AuthorsList] fetching authors...')
      setLoading(true)
      setAuthorsSort?.(queryType)
      const offset = AUTHORS_PER_PAGE * page
      await loadAuthors({
        by: { order: queryType },
        limit: AUTHORS_PER_PAGE,
        offset
      })
      // UPDATE authors to currentAuthors state
      setCurrentAuthors((prev) => [...prev, ...authorsSorted()])
    } catch (error) {
      console.error('[components.AuthorsList] error fetching authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const [currentPage, setCurrentPage] = createSignal<{ followers: number; shouts: number }>({
    followers: 0,
    shouts: 0
  })

  const loadMoreAuthors = () => {
    const by = searchParams?.by as 'followers' | 'shouts' | undefined
    if (!by) return
    const nextPage = currentPage()[by] + 1
    fetchAuthors(by, nextPage).then(() => setCurrentPage({ ...currentPage(), [by]: nextPage }))
  }

  const TabNavigator = () => (
    <div class="row">
      <div class="col-lg-20 col-xl-18">
        <h1>{t('Authors')}</h1>
        <p>{t('Subscribe who you like to tune your personal feed')}</p>
        <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
          <li
            class={clsx({
              ['view-switcher__item--selected']: !searchParams?.by || searchParams?.by === 'shouts'
            })}
          >
            <a href="#" onClick={() => changeSearchParams({ by: 'shouts' })}>
              {t('By shouts')}
            </a>
          </li>
          <li
            class={clsx({
              ['view-switcher__item--selected']: searchParams?.by === 'followers'
            })}
          >
            <a href="#" onClick={() => changeSearchParams({ by: 'followers' })}>
              {t('By popularity')}
            </a>
          </li>
          <li
            class={clsx({
              ['view-switcher__item--selected']: searchParams?.by === 'name'
            })}
          >
            <a href="#" onClick={() => changeSearchParams({ by: 'name' })}>
              {t('By name')}
            </a>
          </li>
          <Show when={searchParams?.by === 'name'}>
            <li class="view-switcher__search">
              <SearchField onChange={(value) => setSearchQuery(value)} />
            </li>
          </Show>
        </ul>
      </div>
    </div>
  )

  const AbcNavigator = () => (
    <div class="row">
      <div class="col-lg-20 col-xl-18">
        <ul class={clsx('nodash', styles.alphabet)}>
          <For each={[...(alphabet() || [])]}>
            {(letter, index) => (
              <li>
                <Show when={letter in byLetterFiltered()} fallback={letter}>
                  <a
                    href={`/author?by=name#letter-${index()}`}
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
  )

  const AbcAuthorsList = () => (
    <For each={sortedKeys() || []}>
      {(letter) => (
        <div class={clsx(styles.group, 'group')}>
          <h2 id={`letter-${alphabet()?.indexOf(letter) || ''}`}>{letter}</h2>
          <div class="container">
            <div class="row">
              <div class="col-lg-20">
                <div class="row">
                  <For each={byLetterFiltered()?.[letter] || []}>
                    {(author) => (
                      <div class={clsx(styles.topic, 'topic col-sm-12 col-md-8')}>
                        <div class="topic-title">
                          <a href={`/@${author.slug}`}>{translateAuthor(author, lang())}</a>
                          <Show when={author.stat?.shouts || 0}>
                            <span class={styles.articlesCounter}>{author.stat?.shouts || 0}</span>
                          </Show>
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
  )

  const AuthorsSortedList = () => (
    <div class={clsx(stylesAuthorList.AuthorsList)}>
      <For each={authors()}>
        {(author) => (
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <AuthorBadge author={author} />
            </div>
          </div>
        )}
      </For>
      <div class="row">
        <div class="col-lg-20 col-xl-18">
          <div class={stylesAuthorList.action}>
            <Show when={!loading() && ((authors() || []).length || 0) > 0}>
              <Button value={t('Load more')} onClick={loadMoreAuthors} aria-live="polite" />
            </Show>
            <Show when={loading()}>
              <InlineLoader />
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
  return (
    <>
      <Show when={props.isLoaded} fallback={<Loading />}>
        <div class="offset-md-5">
          <TabNavigator />
          <Show when={searchParams?.by === 'name'} fallback={<AuthorsSortedList />}>
            <AbcNavigator />
            <AbcAuthorsList />
          </Show>
        </div>
      </Show>
    </>
  )
}
