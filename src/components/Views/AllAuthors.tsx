import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { Icon } from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useAuthorsStore, setSortAllBy as setSortAllAuthorsBy } from '../../stores/zine/authors'
import { handleClientRouteLinkClick, useRouter } from '../../stores/router'
import { useAuthStore } from '../../stores/auth'
import { getLogger } from '../../utils/logger'
import '../../styles/AllTopics.scss'
import { Topic } from '../../graphql/types.gen'

const log = getLogger('AllAuthorsView')

type AllAuthorsPageSearchParams = {
  by: '' | 'name' | 'shouts' | 'rating'
}

type Props = {
  authors: Author[]
}

export const AllAuthorsView = (props: Props) => {
  const { sortedAuthors } = useAuthorsStore({ authors: props.authors })

  const { session } = useAuthStore()

  createEffect(() => {
    setSortAllAuthorsBy(getSearchParams().by || 'shouts')
  })

  const subscribed = (s) => Boolean(session()?.news?.authors && session()?.news?.authors?.includes(s || ''))

  const { getSearchParams } = useRouter<AllAuthorsPageSearchParams>()

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

  // log.debug(getSearchParams())

  return (
    <div class="all-topics-page">
      <Show when={sortedAuthors().length > 0}>
        <div class="wide-container">
          <div class="shift-content">
            <div class="row">
              <div class="col-md-9 page-header">
                <h1>{t('Authors')}</h1>
                <p>{t('Subscribe who you like to tune your personal feed')}</p>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <ul class="view-switcher">
                  <li classList={{ selected: getSearchParams().by === 'shouts' }}>
                    <a href="/authors?by=shouts" onClick={handleClientRouteLinkClick}>
                      {t('By shouts')}
                    </a>
                  </li>
                  <li classList={{ selected: getSearchParams().by === 'rating' }}>
                    <a href="/authors?by=rating" onClick={handleClientRouteLinkClick}>
                      {t('By rating')}
                    </a>
                  </li>
                  <li classList={{ selected: !getSearchParams().by || getSearchParams().by === 'name' }}>
                    <a href="/authors" onClick={handleClientRouteLinkClick}>
                      {t('By alphabet')}
                    </a>
                  </li>
                  <li class="view-switcher__search">
                    <a href="/authors/search">
                      <Icon name="search" />
                      {t('Search author')}
                    </a>
                  </li>
                </ul>
                <Show
                  when={!getSearchParams().by || getSearchParams().by === 'name'}
                  fallback={() => (
                    <div class="stats">
                      <For each={sortedAuthors()}>
                        {(author) => (
                          <AuthorCard
                            author={author}
                            compact={false}
                            hasLink={true}
                            subscribed={subscribed(author.slug)}
                            noSocialButtons={true}
                          />
                        )}
                      </For>
                    </div>
                  )}
                >
                  <For each={sortedKeys()}>
                    {(letter) => (
                      <div class="group">
                        <h2>{letter}</h2>
                        <div class="container">
                          <div class="row">
                            <For each={byLetter()[letter]}>
                              {(author: Author) => (
                                <div class="topic col-sm-6 col-md-3">
                                  <div class="topic-title">
                                    <a href={`/author/${author.slug}`}>{author.name}</a>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
