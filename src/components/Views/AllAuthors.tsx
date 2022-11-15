import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { Icon } from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useAuthorsStore, setAuthorsSort } from '../../stores/zine/authors'
import { useRouter } from '../../stores/router'
import styles from '../../styles/AllTopics.module.scss'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'rating'
}

type Props = {
  authors: Author[]
}

const PAGE_SIZE = 20

export const AllAuthorsView = (props: Props) => {
  const { sortedAuthors } = useAuthorsStore({ authors: props.authors })
  const [limit, setLimit] = createSignal(PAGE_SIZE)

  const { session } = useSession()

  createEffect(() => {
    setAuthorsSort(searchParams().by || 'shouts')
  })

  const subscribed = (s) => Boolean(session()?.news?.authors && session()?.news?.authors?.includes(s || ''))

  const { searchParams } = useRouter<AllAuthorsPageSearchParams>()

  const byLetter = createMemo<{ [letter: string]: Author[] }>(() => {
    return sortedAuthors().reduce((acc, author) => {
      if (!author.name) {
        // name === null for new users
        return acc
      }

      const letter = author.name[0].toUpperCase()
      if (!acc[letter]) {
        acc[letter] = []
      }

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

  return (
    <div class={clsx(styles.allTopicsPage, 'container')}>
      <Show when={sortedAuthors().length > 0}>
        <div class="shift-content">
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
                  <a href="/authors">{t('By alphabet')}</a>
                </li>
                <li class="view-switcher__search">
                  <a href="/authors/search">
                    <Icon name="search" />
                    {t('Search author')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Show
            when={!searchParams().by || searchParams().by === 'name'}
            fallback={() => (
              <div class={styles.stats}>
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
                        />
                      )}
                    </For>
                  </div>
                </div>
                <Show when={sortedAuthors().length > limit()}>
                  <div class="row">
                    <div class={clsx(styles.loadMoreContainer, 'col-12 col-md-10')}>
                      <button class={clsx('button', styles.loadMoreButton)} onClick={showMore}>
                        {t('More')}
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
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
                            {(author: Author) => (
                              <div class={clsx(styles.topic, 'topic col-sm-6 col-md-4')}>
                                <div class="topic-title">
                                  <a href={`/author/${author.slug}`}>{author.name}</a>
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
