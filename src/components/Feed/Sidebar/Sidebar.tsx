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
import Userpic from '../../Author/Userpic'
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
      <ul>
        <li>
          <a
            href={getPagePath(router, 'feed')}
            class={clsx(styles.sidebarItemName, {
              [styles.selected]: page().route === 'feed'
            })}
          >
            <Icon name="feed-all" class={styles.icon} />
            {t('general feed')}
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedMy')}
            class={clsx(styles.sidebarItemName, {
              [styles.selected]: page().route === 'feedMy'
            })}
          >
            <Icon name="feed-my" class={styles.icon} />
            {t('My feed')}
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedCollaborations')}
            class={clsx(styles.sidebarItemName, {
              [styles.selected]: page().route === 'feedCollaborations'
            })}
          >
            <Icon name="feed-collaborate" class={styles.icon} />
            {t('Accomplices')}
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedDiscussions')}
            class={clsx(styles.sidebarItemName, {
              [styles.selected]: page().route === 'feedDiscussions'
            })}
          >
            <Icon name="feed-discussion" class={styles.icon} />
            {t('Discussions')}
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedBookmarks')}
            class={clsx(styles.sidebarItemName, {
              [styles.selected]: page().route === 'feedBookmarks'
            })}
          >
            <Icon name="bookmark" class={styles.icon} />
            {t('Bookmarks')}
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedNotifications')}
            class={clsx(styles.sidebarItemName, {
              [styles.selected]: page().route === 'feedNotifications'
            })}
          >
            <Icon name="feed-notifications" class={styles.icon} />
            {t('Notifications')}
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
                      <Userpic user={authorEntities()[authorSlug]} />
                    </Show>
                    <Show when={!authorEntities()[authorSlug]}>
                      <Icon name="hash" class={styles.icon} />
                    </Show>
                    {authorSlug}
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
        <a href="/feed/settings">
          <Icon name="settings" class={styles.icon} />
          {t('Feed settings')}
        </a>
      </div>
    </div>
  )
}
