import { clsx } from 'clsx'
import { For, Show, createSignal } from 'solid-js'

import { A, useMatch } from '@solidjs/router'
import { useFeed } from '~/context/feed'
import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { Author } from '../../../graphql/schema/core.gen'
import { Userpic } from '../../Author/Userpic'
import { Icon } from '../../_shared/Icon'
import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const { t } = useLocalize()
  const { follows } = useFollowing()
  const { feedByTopic, feedByAuthor, seen } = useFeed()
  const [isSubscriptionsVisible, setSubscriptionsVisible] = createSignal(true)
  const matchFeed = useMatch(() => '/feed')
  const matchFeedMy = useMatch(() => '/feed/followed')
  const matchFeedCollabs = useMatch(() => '/feed/coauthored')
  const matchFeedDiscussions = useMatch(() => '/feed/discussed')
  const checkTopicIsSeen = (topicSlug: string) => {
    return feedByTopic()[topicSlug]?.every((article) => Boolean(seen()[article.slug]))
  }

  const checkAuthorIsSeen = (authorSlug: string) => {
    return feedByAuthor()[authorSlug]?.every((article) => Boolean(seen()[article.slug]))
  }

  return (
    <div class={styles.sidebar}>
      <ul class={styles.feedFilters}>
        <li>
          <A
            href={'feed'}
            class={clsx({
              [styles.selected]: matchFeed()
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-all" class={styles.icon} />
              {t('All')}
            </span>
          </A>
        </li>
        <li>
          <A
            href={'/feed/followed'}
            class={clsx({
              [styles.selected]: matchFeedMy()
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-my" class={styles.icon} />
              {t('My feed')}
            </span>
          </A>
        </li>
        <li>
          <A
            href={'/feed/coauthored'}
            class={clsx({
              [styles.selected]: matchFeedCollabs()
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-collaborate" class={styles.icon} />
              {t('Participation')}
            </span>
          </A>
        </li>
        <li>
          <a
            href={'/feed/discussed'}
            class={clsx({
              [styles.selected]: matchFeedDiscussions()
            })}
          >
            <span class={styles.sidebarItemName}>
              <Icon name="feed-discussion" class={styles.icon} />
              {t('Discussions')}
            </span>
          </a>
        </li>
      </ul>

      <Show when={(follows?.authors?.length || 0) > 0 || (follows?.topics?.length || 0) > 0}>
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
          <For each={follows.authors}>
            {(a: Author) => (
              <li>
                <a href={`/author/${a.slug}`} classList={{ [styles.unread]: checkAuthorIsSeen(a.slug) }}>
                  <div class={styles.sidebarItemName}>
                    <Userpic name={a.name || ''} userpic={a.pic || ''} size="XS" class={styles.userpic} />
                    <div class={styles.sidebarItemNameLabel}>{a.name}</div>
                  </div>
                </a>
              </li>
            )}
          </For>
          <For each={follows.topics}>
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
