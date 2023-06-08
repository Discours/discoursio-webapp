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
  const [isSubscriptionsVisible, setSubscriptionsVisible] = createSignal(true)

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
      title: t('My feed')
    },
    {
      icon: 'feed-collaborate',
      title: t('Accomplices')
    },
    {
      icon: 'feed-discussion',
      title: t('Discussions'),
      counter: 4
    },
    {
      icon: 'feed-drafts',
      title: t('Drafts'),
      counter: 14
    },
    {
      icon: 'bookmark',
      title: t('Bookmarks'),
      counter: 6
    },
    {
      icon: 'feed-notifications',
      title: t('Notifications')
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
                </span>
                {item.counter && <span class={styles.counter}>18</span>}
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
                      <Userpic user={authorEntities()[authorSlug]?.userpic} />
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
