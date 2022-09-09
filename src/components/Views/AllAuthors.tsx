import { createEffect, createSignal, For, Show } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { byFirstChar, sortBy } from '../../utils/sortby'
import { groupByName } from '../../utils/groupby'
import Icon from '../Nav/Icon'
import { t } from '../../utils/intl'
import { useAuthorsStore } from '../../stores/zine/authors'
import { route, params as paramsStore } from '../../stores/router'
import { session } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import '../../styles/AllTopics.scss'

export const AllAuthorsPage = (props: any) => {
  const { getSortedAuthors: authorslist } = useAuthorsStore(props.authors)
  const [sortedAuthors, setSortedAuthors] = createSignal<Author[]>([])
  const [sortedKeys, setSortedKeys] = createSignal<string[]>([])
  const [abc, setAbc] = createSignal([])
  const auth = useStore(session)
  const subscribed = (s) => Boolean(auth()?.info?.authors && auth()?.info?.authors?.includes(s || ''))
  const params = useStore(paramsStore)
  createEffect(() => {
    if ((!params()['by'] || params()['by'] === 'abc') && abc().length === 0) {
      console.log('[authors] default grouping by abc')
      const grouped = { ...groupByName(authorslist()) }
      grouped['A-Z'] = sortBy(grouped['A-Z'], byFirstChar)
      setAbc(grouped)
      const keys = Object.keys(abc)
      keys.sort()
      setSortedKeys(keys as string[])
    } else {
      console.log('[authors] sorting by ' + params()['by'])
      setSortedAuthors(sortBy(authorslist(), params()['by']))
    }
  }, [authorslist(), params()])

  return (
    <div class="all-topics-page">
      <Show when={sortedAuthors()}>
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
                  <li classList={{ selected: params()['by'] === 'shouts' }}>
                    <a href="/authors?by=shouts" onClick={route}>
                      {t('By shouts')}
                    </a>
                  </li>
                  <li classList={{ selected: params()['by'] === 'rating' }}>
                    <a href="/authors?by=rating" onClick={route}>
                      {t('By rating')}
                    </a>
                  </li>
                  <li classList={{ selected: !params()['by'] || params()['by'] === 'abc' }}>
                    <a href="/authors" onClick={route}>
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
                  when={!params()['by'] || params()['by'] === 'abc'}
                  fallback={() => (
                    <div class="stats">
                      <For each={sortedAuthors()}>
                        {(author: Author) => (
                          <AuthorCard
                            author={author}
                            compact={false}
                            hasLink={true}
                            subscribed={subscribed(author.slug)}
                          />
                        )}
                      </For>
                    </div>
                  )}
                >
                  <For each={sortedKeys()}>
                    {(letter: string) => (
                      <div class="group">
                        <h2>{letter}</h2>
                        <div class="container">
                          <div class="row">
                            <For each={abc()[letter]}>
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
