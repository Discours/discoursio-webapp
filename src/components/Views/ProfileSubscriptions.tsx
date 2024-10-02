import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { SearchField } from '~/components/_shared/SearchField'
import { FollowsFilter, useFollowing } from '~/context/following'
import { useLocalize } from '~/context/localize'
import { Author, Topic } from '~/graphql/schema/core.gen'
import { dummyFilter } from '~/intl/dummyFilter'
import { AuthorBadge } from '../Author/AuthorBadge'
import { ProfileSettingsNavigation } from '../ProfileNav'
import { TopicBadge } from '../Topic/TopicBadge'

import stylesSettings from '~/styles/views/FeedSettings.module.scss'
import styles from '~/styles/views/ProfileSettings.module.scss'

export const ProfileSubscriptions = () => {
  const { t, lang } = useLocalize()
  const { follows } = useFollowing()
  const [flatFollows, setFlatFollows] = createSignal<Array<Author | Topic>>([])
  const [filtered, setFiltered] = createSignal<Array<Author | Topic>>([])
  const [followsFilter, setFollowsFilter] = createSignal<FollowsFilter>('all')
  const [searchQuery, setSearchQuery] = createSignal('')

  createEffect(() => setFlatFollows([...(follows?.authors || []), ...(follows?.topics || [])]))

  createEffect(
    on([flatFollows, followsFilter], ([flat, mode]) => {
      if (mode === 'authors') {
        setFiltered(flat.filter((s) => 'name' in s))
      } else if (mode === 'topics') {
        setFiltered(flat.filter((s) => 'title' in s))
      } else {
        setFiltered(flat)
      }
    })
  )

  createEffect(() => {
    if (searchQuery()) {
      setFiltered(dummyFilter(flatFollows(), searchQuery(), lang()))
    }
  })

  return (
    <div class="wide-container">
      <div class="row">
        <div class="col-md-5">
          <div class={clsx('left-navigation', styles.leftNavigation)}>
            <ProfileSettingsNavigation />
          </div>
        </div>

        <div class="col-md-19">
          <div class="row">
            <div class="col-md-20 col-lg-18 col-xl-16">
              <h1>{t('My subscriptions')}</h1>
              <p class="description">{t('Here you can manage all your Discours subscriptions')}</p>
              <Show when={flatFollows()} fallback={<Loading />}>
                <ul class="view-switcher">
                  <li
                    class={clsx({
                      'view-switcher__item--selected': followsFilter() === 'all'
                    })}
                  >
                    <button type="button" onClick={() => setFollowsFilter('all')}>
                      {t('All')}
                    </button>
                  </li>
                  <li
                    class={clsx({
                      'view-switcher__item--selected': followsFilter() === 'authors'
                    })}
                  >
                    <button type="button" onClick={() => setFollowsFilter('authors')}>
                      {t('Authors')}
                    </button>
                  </li>
                  <li
                    class={clsx({
                      'view-switcher__item--selected': followsFilter() === 'topics'
                    })}
                  >
                    <button type="button" onClick={() => setFollowsFilter('topics')}>
                      {t('Topics')}
                    </button>
                  </li>
                </ul>

                <div class={clsx('pretty-form__item', styles.searchContainer)}>
                  <SearchField
                    onChange={(value) => setSearchQuery(value)}
                    class={styles.searchField}
                    variant="bordered"
                  />
                </div>

                <div class={clsx(stylesSettings.settingsList, styles.topicsList)}>
                  <For each={filtered()}>
                    {(followingItem) => (
                      <div>
                        {'name' in followingItem ? (
                          <AuthorBadge minimize={true} author={followingItem as Author} />
                        ) : (
                          <TopicBadge minimize={true} topic={followingItem as Topic} />
                        )}
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
