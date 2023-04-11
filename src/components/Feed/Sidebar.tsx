import { For } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { useAuthorsStore } from '../../stores/zine/authors'

import { Icon } from '../_shared/Icon'
import { useTopicsStore } from '../../stores/zine/topics'
import { useArticlesStore } from '../../stores/zine/articles'
import { useSeenStore } from '../../stores/zine/seen'
import { useSession } from '../../context/session'
import styles from './Sidebar.module.scss'
import { useLocalize } from '../../context/localize'

type FeedSidebarProps = {
  authors: Author[]
}

export const FeedSidebar = (props: FeedSidebarProps) => {
  const { t } = useLocalize()
  const { seen } = useSeenStore()
  const { session } = useSession()
  const { authorEntities } = useAuthorsStore({ authors: props.authors })
  const { articlesByTopic } = useArticlesStore()
  const { topicEntities } = useTopicsStore()

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
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="feed-all" class={styles.icon} />
              <strong>общая лента</strong>
            </span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="feed-my" class={styles.icon} />
              моя лента
            </span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="feed-collaborate" class={styles.icon} />
              соучастие
            </span>
            <span class={styles.counter}>7</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="feed-discussion" class={styles.icon} />
              дискуссии
            </span>
            <span class={styles.counter}>18</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="feed-drafts" class={styles.icon} />
              черновики
            </span>
            <span class={styles.counter}>283</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="bookmark" class={styles.icon} />
              закладки
            </span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class={styles.sidebarItemName}>
              <Icon name="feed-notifications" class={styles.icon} />
              уведомления
            </span>
            <span class={styles.counter}>283</span>
          </a>
        </li>
      </ul>

      <ul>
        <li>
          <a href="/feed?by=subscribed">
            <strong>{t('My subscriptions')}</strong>
          </a>
        </li>

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
              <a href={`/author/${topicSlug}`} classList={{ [styles.unread]: checkTopicIsSeen(topicSlug) }}>
                {topicEntities()[topicSlug]?.title}
              </a>
            </li>
          )}
        </For>
      </ul>

      <div class={styles.settings}>
        <a href="/feed/settings">
          <Icon name="settings" class={styles.icon} />
          {t('Feed settings')}
        </a>
      </div>
    </div>
  )
}
