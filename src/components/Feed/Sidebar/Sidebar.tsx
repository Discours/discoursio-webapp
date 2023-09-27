import { createSignal, For, Show } from 'solid-js'
import type { Author } from '../../../graphql/types.gen'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { Icon } from '../../_shared/Icon'
import { useTopicsStore } from '../../../stores/zine/topics'
import { useArticlesStore } from '../../../stores/zine/articles'
import { useSeenStore } from '../../../stores/zine/seen'
import { useSession } from '../../../context/session'
import { useLocalize } from '../../../context/localize'
import styles from './Sidebar.module.scss'
import { clsx } from 'clsx'
import { Userpic } from '../../Author/Userpic'
import { getPagePath } from '@nanostores/router'
import { router, useRouter } from '../../../stores/router'

type FeedSidebarProps = {
  authors: Author[]
}

export const Sidebar = (props: FeedSidebarProps) => {
  const { t } = useLocalize()
  const { seen } = useSeenStore()
  const { session } = useSession()
  const { page } = useRouter()
  const { authorEntities } = useAuthorsStore({ authors: props.authors })
  const { articlesByTopic } = useArticlesStore()
  const { topicEntities } = useTopicsStore()
  const [isSubscriptionsVisible, setSubscriptionsVisible] = createSignal(true)

  const checkTopicIsSeen = (topicSlug: string) => {
    return articlesByTopic()[topicSlug]?.every((article) => Boolean(seen()[article.slug]))
  }

  const checkAuthorIsSeen = (authorSlug: string) => {
    return Boolean(seen()[authorSlug])
  }

  return (
    <div class={styles.sidebar}>
      <ul class={styles.feedFilters}>
        <li>
          <a
            href={getPagePath(router, 'feed')}
            class={clsx({
              [styles.selected]: page().route === 'feed'
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-all" class={styles.icon} />
              {t('general feed')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedMy')}
            class={clsx({
              [styles.selected]: page().route === 'feedMy'
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-my" class={styles.icon} />
              {t('My feed')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedCollaborations')}
            class={clsx({
              [styles.selected]: page().route === 'feedCollaborations'
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-collaborate" class={styles.icon} />
              {t('Accomplices')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedDiscussions')}
            class={clsx({
              [styles.selected]: page().route === 'feedDiscussions'
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-discussion" class={styles.icon} />
              {t('Discussions')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedBookmarks')}
            class={clsx({
              [styles.selected]: page().route === 'feedBookmarks'
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="bookmark" class={styles.icon} />
              {t('Bookmarks')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedNotifications')}
            class={clsx({
              [styles.selected]: page().route === 'feedNotifications'
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-notifications" class={styles.icon} />
              {t('Notifications')}
            </span>
          </a>
        </li>
      </ul>

      <Show when={session()?.news?.authors || session()?.news?.topics}>
        <h4
          classList={{ [styles.opened]: isSubscriptionsVisible() }}
          onClick={() => {
            setSubscriptionsVisible(!isSubscriptionsVisible())
          }}
        >
          {t('My subscriptions')}
        </h4>

        <ul class={clsx(styles.subscriptions, { [styles.hidden]: !isSubscriptionsVisible() })}>
          <For each={session()?.news?.authors}>
            {(authorSlug: string) => (
              <li>
                <a
                  href={`/author/${authorSlug}`}
                  classList={{ [styles.unread]: checkAuthorIsSeen(authorSlug) }}
                >
                  <div class={styles.sidebarItemName}>
                    <Show when={authorEntities()[authorSlug]}>
                      <Userpic
                        name={authorEntities()[authorSlug].name}
                        userpic={authorEntities()[authorSlug].userpic}
                      />
                    </Show>
                    <Show when={!authorEntities()[authorSlug]}>
                      <Icon name="hash" class={styles.icon} />
                    </Show>
                    {authorEntities()[authorSlug]?.name}
                  </div>
                </a>
              </li>
            )}
          </For>
          <For each={session()?.news?.topics}>
            {(topicSlug: string) => (
              <li>
                <a
                  href={`/topic/${topicSlug}`}
                  classList={{ [styles.unread]: checkTopicIsSeen(topicSlug) }}
                >
                  <div class={styles.sidebarItemName}>
                    <Icon name="hash" class={styles.icon} />
                    {topicEntities()[topicSlug]?.title ?? topicSlug}
                  </div>
                </a>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <div class={styles.settings}>
        <a href="/profile/subscriptions">
          <Icon name="settings" class={styles.icon} />
          <span class={styles.settingsLabel}>{t('Feed settings')}</span>
        </a>
      </div>
    </div>
  )
}
