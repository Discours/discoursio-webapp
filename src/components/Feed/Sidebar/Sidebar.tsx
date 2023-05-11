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

type FeedSidebarProps = {
  authors: Author[]
}

type ListItem = {
  title: string
  icon?: string
  counter?: number
  href?: string
  isBold?: boolean
}

export const Sidebar = (props: FeedSidebarProps) => {
  const { t } = useLocalize()
  const { seen } = useSeenStore()
  const { session } = useSession()
  const { authorEntities } = useAuthorsStore({ authors: props.authors })
  const { articlesByTopic } = useArticlesStore()
  const { topicEntities } = useTopicsStore()
  const [isSubscriptionsVisible, setSubscriptionsVisible] = createSignal(false)

  const checkTopicIsSeen = (topicSlug: string) => {
    return articlesByTopic()[topicSlug]?.every((article) => Boolean(seen()[article.slug]))
  }

  const checkAuthorIsSeen = (authorSlug: string) => {
    return Boolean(seen()[authorSlug])
  }

  const menuItems: ListItem[] = [
    {
      icon: 'feed-all',
      title: t('general feed')
    },
    {
      icon: 'feed-my',
      title: t('my feed')
    },
    {
      icon: 'feed-collaborate',
      title: t('accomplices')
    },
    {
      icon: 'feed-discussion',
      title: t('discussions'),
      counter: 4
    },
    {
      icon: 'feed-drafts',
      title: t('drafts'),
      counter: 14
    },
    {
      icon: 'bookmark',
      title: t('bookmarks'),
      counter: 6
    },
    {
      icon: 'feed-notifications',
      title: t('notifications')
    }
  ]

  return (
    <div class={styles.sidebar}>
      <ul>
        <For each={menuItems}>
          {(item: ListItem) => (
            <li>
              <a href="#">
                <span class={styles.sidebarItemName}>
                  {item.icon && <Icon name={item.icon} class={styles.icon} />}
                  <strong>{item.title}</strong>
                  {item.counter && <span class={styles.counter}>18</span>}
                </span>
              </a>
            </li>
          )}
        </For>
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
        <ul classList={{ [styles.hidden]: !isSubscriptionsVisible() }}>
          <For each={session()?.news?.authors}>
            {(authorSlug: string) => (
              <li>
                <a
                  href={`/author/${authorSlug}`}
                  classList={{ [styles.unread]: checkAuthorIsSeen(authorSlug) }}
                >
                  <small>@{authorSlug}</small>
                  {authorEntities()[authorSlug]?.name}
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
                  {topicEntities()[topicSlug]?.title ?? topicSlug}
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
