import type { Author } from '../../graphql/schema/core.gen'

import { Meta } from '@solidjs/meta'
import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useRouter } from '../../stores/router'
import { loadAuthors, setAuthorsSort, useAuthorsStore } from '../../stores/zine/authors'
import { dummyFilter } from '../../utils/dummyFilter'
import { getImageUrl } from '../../utils/getImageUrl'
import { scrollHandler } from '../../utils/scroll'
import { Loading } from '../_shared/Loading'
import { SearchField } from '../_shared/SearchField'
import { AuthorBadge } from '../Author/AuthorBadge'

import styles from './AllAuthors.module.scss'

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'followers'
}

type Props = {
  authors: Author[]
  isLoaded: boolean
}

const PAGE_SIZE = 20
const ALPHABET = [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ@']

export const AllAuthorsView = (props: Props) => {
  const { t, lang } = useLocalize()
  const [offsetByShouts, setOffsetByShouts] = createSignal(0)
  const [offsetByFollowers, setOffsetByFollowers] = createSignal(0)
  const { searchParams, changeSearchParams } = useRouter<AllAuthorsPageSearchParams>()
  const { sortedAuthors } = useAuthorsStore({
    authors: props.authors,
    sortBy: searchParams().by || 'name',
  })

  const [searchQuery, setSearchQuery] = createSignal('')
  const offset = searchParams()?.by === 'shouts' ? offsetByShouts : offsetByFollowers
  createEffect(() => {
    let by = searchParams().by
    if (by) {
      setAuthorsSort(by)
    } else {
      by = 'name'
      changeSearchParams({ by })
    }
  })

  const loadMoreByShouts = async () => {
    await loadAuthors({ by: { order: 'shouts_stat' }, limit: PAGE_SIZE, offset: offsetByShouts() })
    setOffsetByShouts((o) => o + PAGE_SIZE)
  }
  const loadMoreByFollowers = async () => {
    await loadAuthors({ by: { order: 'followers_stat' }, limit: PAGE_SIZE, offset: offsetByFollowers() })
    setOffsetByFollowers((o) => o + PAGE_SIZE)
  }

  const isStatsLoaded = createMemo(() => sortedAuthors() && sortedAuthors().some((author) => author.stat))

  createEffect(async () => {
    if (!isStatsLoaded()) {
      await loadMoreByShouts()
      await loadMoreByFollowers()
    }
  })

  const showMore = async () =>
    await {
      shouts: loadMoreByShouts,
      followers: loadMoreByFollowers,
    }[searchParams().by]()

  const byLetter = createMemo<{ [letter: string]: Author[] }>(() => {
    return sortedAuthors().reduce(
      (acc, author) => {
        let letter = ''
        if (author && author.name) {
          const nameParts = author.name.trim().split(' ')
          const lastName = nameParts.pop()
          if (lastName && lastName.length > 0) {
            letter = lastName[0].toUpperCase()
          }
        }

        if (/[^ËА-яё]/.test(letter) && lang() === 'ru') letter = '@'

        if (!acc[letter]) acc[letter] = []

        acc[letter].push(author)
        return acc
      },
      {} as { [letter: string]: Author[] },
    )
  })

  const sortedKeys = createMemo<string[]>(() => {
    const keys = Object.keys(byLetter())
    keys.sort()
    keys.push(keys.shift())
    return keys
  })

  const filteredAuthors = createMemo(() => {
    return dummyFilter(sortedAuthors(), searchQuery(), lang())
  })

  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Authors')
  const description = t('List of authors of the open editorial community')

  return (
    <div class={clsx(styles.allAuthorsPage, 'wide-container')}>
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
      <Show when={props.isLoaded} fallback={<Loading />}>
        <div class="offset-md-5">
          <div class="row">
            <div class="col-lg-20 col-xl-18">
              <h1>{t('Authors')}</h1>
              <p>{t('Subscribe who you like to tune your personal feed')}</p>
              <Show when={isStatsLoaded()}>
                <ul class={clsx(styles.viewSwitcher, 'view-switcher')}>
                  <li
                    classList={{
                      'view-switcher__item--selected': !searchParams().by || searchParams().by === 'shouts',
                    }}
                  >
                    <a href="/authors?by=shouts">{t('By shouts')}</a>
                  </li>
                  <li classList={{ 'view-switcher__item--selected': searchParams().by === 'followers' }}>
                    <a href="/authors?by=followers">{t('By popularity')}</a>
                  </li>
                  <li classList={{ 'view-switcher__item--selected': searchParams().by === 'name' }}>
                    <a href="/authors?by=name">{t('By name')}</a>
                  </li>
                  <Show when={searchParams().by !== 'name'}>
                    <li class="view-switcher__search">
                      <SearchField onChange={(value) => setSearchQuery(value)} />
                    </li>
                  </Show>
                </ul>
              </Show>
            </div>
          </div>

          <Show when={sortedAuthors().length > 0}>
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
                                    <Show when={author.stat}>
                                      <span class={styles.articlesCounter}>{author.stat.shouts}</span>
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
            </Show>

            <Show when={searchParams().by && searchParams().by !== 'name'}>
              <For each={filteredAuthors().slice(0, PAGE_SIZE)}>
                {(author) => (
                  <div class="row">
                    <div class="col-lg-20 col-xl-18">
                      <AuthorBadge author={author as Author} />
                    </div>
                  </div>
                )}
              </For>
            </Show>

            <Show when={filteredAuthors().length > PAGE_SIZE + offset() && searchParams().by !== 'name'}>
              <div class="row">
                <div class={clsx(styles.loadMoreContainer, 'col-24 col-md-20')}>
                  <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                    {t('Load more')}
                  </button>
                </div>
              </div>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}
