import { clsx } from 'clsx'
import { createEffect, createSignal, For, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Author, Topic } from '../../../graphql/types.gen'
import { SubscriptionFilter } from '../../../pages/types'
import { apiClient } from '../../../utils/apiClient'
import { dummyFilter } from '../../../utils/dummyFilter'
// TODO: refactor styles
import { isAuthor } from '../../../utils/isAuthor'
import { Loading } from '../../_shared/Loading'
import { SearchField } from '../../_shared/SearchField'
import { AuthorBadge } from '../../Author/AuthorBadge'
import { ProfileSettingsNavigation } from '../../Nav/ProfileSettingsNavigation'
import { TopicBadge } from '../../Topic/TopicBadge'

import styles from '../../../pages/profile/Settings.module.scss'
import stylesSettings from '../../../styles/FeedSettings.module.scss'

export const ProfileSubscriptions = () => {
  const { t, lang } = useLocalize()
  const { user } = useSession()
  const [following, setFollowing] = createSignal<Array<Author | Topic>>([])
  const [filtered, setFiltered] = createSignal<Array<Author | Topic>>([])
  const [subscriptionFilter, setSubscriptionFilter] = createSignal<SubscriptionFilter>('all')
  const [searchQuery, setSearchQuery] = createSignal('')

  const fetchSubscriptions = async () => {
    try {
      const [getAuthors, getTopics] = await Promise.all([
        apiClient.getAuthorFollowingUsers({ slug: user().slug }),
        apiClient.getAuthorFollowingTopics({ slug: user().slug }),
      ])
      setFollowing([...getAuthors, ...getTopics])
      setFiltered([...getAuthors, ...getTopics])
    } catch (error) {
      console.error('[fetchSubscriptions] :', error)
      throw error
    }
  }

  createEffect(() => {
    if (following()) {
      if (subscriptionFilter() === 'users') {
        setFiltered(following().filter((s) => 'name' in s))
      } else if (subscriptionFilter() === 'topics') {
        setFiltered(following().filter((s) => 'title' in s))
      } else {
        setFiltered(following())
      }
    }
    if (searchQuery()) {
      setFiltered(dummyFilter(following(), searchQuery(), lang()))
    }
  })

  onMount(async () => {
    await fetchSubscriptions()
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
              <Show when={following()} fallback={<Loading />}>
                <ul class="view-switcher">
                  <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'all' })}>
                    <button type="button" onClick={() => setSubscriptionFilter('all')}>
                      {t('All')}
                    </button>
                  </li>
                  <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'users' })}>
                    <button type="button" onClick={() => setSubscriptionFilter('users')}>
                      {t('Authors')}
                    </button>
                  </li>
                  <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'topics' })}>
                    <button type="button" onClick={() => setSubscriptionFilter('topics')}>
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
                        {isAuthor(followingItem) ? (
                          <AuthorBadge minimizeSubscribeButton={true} author={followingItem} />
                        ) : (
                          <TopicBadge minimizeSubscribeButton={true} topic={followingItem} />
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
