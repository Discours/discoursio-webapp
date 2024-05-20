import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'
import { For, Show, createSignal } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useSeen } from '../../../context/seen'
import { Author } from '../../../graphql/schema/core.gen'
import { router, useRouter } from '../../../stores/router'
import { useArticlesStore } from '../../../stores/zine/articles'
import { Userpic } from '../../Author/Userpic'
import { Icon } from '../../_shared/Icon'
import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const { t } = useLocalize()
  const { seen } = useSeen()
  const { subscriptions } = useFollowing()
  const { page } = useRouter()
  const { articlesByTopic, articlesByAuthor } = useArticlesStore()
  const [isSubscriptionsVisible, setSubscriptionsVisible] = createSignal(true)

  const checkTopicIsSeen = (topicSlug: string) => {
    return articlesByTopic()[topicSlug]?.every((article) => Boolean(seen()[article.slug]))
  }

  const checkAuthorIsSeen = (authorSlug: string) => {
    return articlesByAuthor()[authorSlug]?.every((article) => Boolean(seen()[article.slug]))
  }

  return (
    <div class={styles.sidebar}>
      <ul class={styles.feedFilters}>
        <li>
          <a
            href={getPagePath(router, 'feed')}
            class={clsx({
              [styles.selected]: page().route === 'feed',
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-all" class={styles.icon} />
              {t('All')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedMy')}
            class={clsx({
              [styles.selected]: page().route === 'feedMy',
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
              [styles.selected]: page().route === 'feedCollaborations',
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-collaborate" class={styles.icon} />
              {t('Participation')}
            </span>
          </a>
        </li>
        <li>
          <a
            href={getPagePath(router, 'feedDiscussions')}
            class={clsx({
              [styles.selected]: page().route === 'feedDiscussions',
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-discussion" class={styles.icon} />
              {t('Discussions')}
            </span>
          </a>
        </li>
      </ul>

      <Show when={subscriptions.authors.length > 0 || subscriptions.topics.length > 0}>
        <h4
          classList={{ [styles.opened]: isSubscriptionsVisible() }}
          onClick={() => {
            setSubscriptionsVisible(!isSubscriptionsVisible())
          }}
        >
          {t('My subscriptions')}
          <Icon name="toggle-arrow" class={styles.icon} />
        </h4>

        <ul class={clsx(styles.subscriptions, { [styles.hidden]: !isSubscriptionsVisible() })}>
          <For each={subscriptions.authors}>
            {(a: Author) => (
              <li>
                <a href={`/author/${a.slug}`} classList={{ [styles.unread]: checkAuthorIsSeen(a.slug) }}>
                  <div class={styles.sidebarItemName}>
                    <Userpic name={a.name} userpic={a.pic} size="XS" class={styles.userpic} />
                    <div class={styles.sidebarItemNameLabel}>{a.name}</div>
                  </div>
                </a>
              </li>
            )}
          </For>
          <For each={subscriptions.topics}>
            {(topic) => (
              <li>
                <a
                  href={`/topic/${topic.slug}`}
                  classList={{ [styles.unread]: checkTopicIsSeen(topic.slug) }}
                >
                  <div class={styles.sidebarItemName}>
                    <Icon name="hash" class={styles.icon} />
                    <div class={styles.sidebarItemNameLabel}>{topic.title}</div>
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
