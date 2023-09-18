import { PageLayout } from '../../components/_shared/PageLayout'
import styles from './Settings.module.scss'
import stylesSettings from '../../styles/FeedSettings.module.scss'
import { clsx } from 'clsx'
import { ProfileSettingsNavigation } from '../../components/Nav/ProfileSettingsNavigation'
import { SearchField } from '../../components/_shared/SearchField'
import { createEffect, createSignal, For, onMount, Show } from 'solid-js'
import { Author, Topic } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { useSession } from '../../context/session'
import { isAuthor } from '../../utils/isAuthor'
import { useLocalize } from '../../context/localize'
import { SubscriptionFilter } from '../types'
import { Loading } from '../../components/_shared/Loading'
import { TopicCard } from '../../components/Topic/Card'
import { AuthorCard } from '../../components/Author/AuthorCard'
import { dummyFilter } from '../../utils/dummyFilter'

export const ProfileSubscriptionsPage = () => {
  const { t, lang } = useLocalize()
  const { user, isAuthenticated } = useSession()
  const [following, setFollowing] = createSignal<Array<Author | Topic>>([])
  const [filtered, setFiltered] = createSignal<Array<Author | Topic>>([])
  const [subscriptionFilter, setSubscriptionFilter] = createSignal<SubscriptionFilter>('all')
  const [searchQuery, setSearchQuery] = createSignal('')

  const fetchSubscriptions = async () => {
    try {
      const [getAuthors, getTopics] = await Promise.all([
        apiClient.getAuthorFollowingUsers({ slug: user().slug }),
        apiClient.getAuthorFollowingTopics({ slug: user().slug })
      ])
      setFollowing([...getAuthors, ...getTopics])
      setFiltered([...getAuthors, ...getTopics])
    } catch (error) {
      console.error('[fetchSubscriptions] :', error)
      throw error
    }
  }

  onMount(async () => {
    if (isAuthenticated()) {
      await fetchSubscriptions()
    }
  })

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
    setFiltered(dummyFilter(following(), searchQuery(), lang()))
  })

  return (
    <PageLayout>
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
                <p class="description">{t('Here you can manage all your Discourse subscriptions')}</p>
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
                    <li
                      class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'topics' })}
                    >
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
                            <AuthorCard
                              author={followingItem}
                              hideWriteButton={true}
                              hasLink={true}
                              isTextButton={true}
                              truncateBio={true}
                              minimizeSubscribeButton={true}
                            />
                          ) : (
                            <TopicCard
                              compact
                              isTopicInRow
                              showDescription
                              isCardMode
                              topic={followingItem}
                              minimizeSubscribeButton={true}
                            />
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
    </PageLayout>
  )
}

export const Page = ProfileSubscriptionsPage
