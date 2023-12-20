import { getPagePath, openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createEffect, For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useNotifications } from '../../../context/notifications'
import { Reaction } from '../../../graphql/schema/core.gen'
import { Notification } from '../../../graphql/schema/notifier.gen'
import { useRouter, router } from '../../../stores/router'
import { GroupAvatar } from '../../_shared/GroupAvatar'
import { TimeAgo } from '../../_shared/TimeAgo'
import { ArticlePageSearchParams } from '../../Article/FullArticle'

import styles from './NotificationView.module.scss'

type NotificationGroupProps = {
  notifications: Notification[]
  onClick: () => void
  dateTimeFormat: 'ago' | 'time' | 'date'
  class?: string
}

const getTitle = (title: string) => {
  let shoutTitle = ''
  let i = 0
  const shoutTitleWords = title.split(' ')

  while (shoutTitle.length <= 30 && i < shoutTitleWords.length) {
    shoutTitle += shoutTitleWords[i] + ' '
    i++
  }

  if (shoutTitle.length < title.length) {
    shoutTitle = `${shoutTitle.trim()}...`

    if (shoutTitle[0] === '«') {
      shoutTitle += '»'
    }
  }
  return shoutTitle
}

const reactionsCaption = (threadId: string) =>
  threadId.includes('__') ? 'Some new replies to your comment' : 'Some new comments to your publication'

export const NotificationGroup = (props: NotificationGroupProps) => {
  const { t, formatTime, formatDate } = useLocalize()
  const { changeSearchParam } = useRouter<ArticlePageSearchParams>()
  const {
    actions: { hideNotificationsPanel, markNotificationAsRead },
  } = useNotifications()
  const threads = new Map<string, Reaction[]>()
  const notificationsByThread = new Map<string, Notification[]>()

  const handleClick = (threadId: string) => {
    props.onClick()

    notificationsByThread.get(threadId).forEach((n: Notification) => {
      if (!n.seen) markNotificationAsRead(n)
    })

    const threadParts = threadId.replace('::seen', '').split('__')
    openPage(router, 'article', { slug: threadParts[0] })
    if (threadParts.length > 1) {
      changeSearchParam({ commentId: threadParts[1] })
    }
  }

  createEffect(() => {
    const threadsLatest = {}

    // count occurencies and sort reactions by threads
    props.notifications.forEach((n: Notification) => {
      const reaction = JSON.parse(n.payload)
      const slug = reaction.shout.slug
      const timestamp = reaction.created_at
      // threadId never shows up and looks like <slug>-<reaction_id>
      const threadId = slug + (reaction.reply_to ? `__${reaction.reply_to}` : '') + (n.seen ? `::seen` : '')
      const rrr = threads.get(threadId) || []
      const nnn = notificationsByThread.get(threadId) || []
      switch (n.entity) {
        case 'reaction': {
          switch (n.action) {
            case 'create': {
              rrr.push(reaction)
              threads.set(threadId, rrr)
              nnn.push(n)
              notificationsByThread.set(threadId, nnn)
              if (!(threadId in threadsLatest)) threadsLatest[threadId] = timestamp
              else if (timestamp > threadsLatest) threadsLatest[threadId] = timestamp

              break
            }
            case 'delete': {
              // TODO: remove reaction from thread, update storage

              break
            }
            case 'update': {
              // TODO: ignore for thread, update in storage

              break
            }
            // No default
          }

          break
        }
        case 'shout': {
          // TODO: handle notification about the
          // new shout from subscribed author, topic
          // or community (means all for one community)

          break
        }
        case 'follower': {
          // TODO: handle new follower notification

          break
        }
        default:
        // bypass chat and messages SSE
      }
    })

    // sort reactions and threads by created_at
    Object.entries(threads)
      .sort(([ak, _av], [bk, _bv]) => threadsLatest[bk] - threadsLatest[ak])
      .forEach(([threadId, reaction], _idx, _arr) => {
        const rrr = threads.get(threadId) || []
        if (!rrr.includes(reaction)) {
          const updatedReactions: Reaction[] = [...rrr, reaction].sort(
            (a, b) => b.created_at - a.created_at,
          )
          threads.set(threadId, updatedReactions)
        }
      })
  })
  const handleLinkClick = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation()
    hideNotificationsPanel()
  }

  return (
    <>
      <For each={[...threads.entries()]}>
        {([threadId, reactions], _index) => (
          <>
            {t(reactionsCaption(threadId), { commentsCount: reactions.length })}{' '}
            <div
              class={clsx(styles.NotificationView, props.class, {
                [styles.seen]: threadId.endsWith('::seen'),
              })}
              onClick={(_) => handleClick(threadId)}
            >
              <div class={styles.userpic}>
                <GroupAvatar authors={reactions.map((r: Reaction) => r.created_by)} />
              </div>
              <div>
                <a
                  href={getPagePath(router, 'article', { slug: reactions[-1].shout.slug })}
                  onClick={handleLinkClick}
                >
                  {getTitle(reactions[-1].shout.title)}
                </a>{' '}
                {t('from')}{' '}
                <a
                  href={getPagePath(router, 'author', { slug: reactions[-1].created_by.slug })}
                  onClick={handleLinkClick}
                >
                  {reactions[-1].created_by.name}
                </a>{' '}
              </div>

              <div class={styles.timeContainer}>
                <Show when={props.dateTimeFormat === 'ago'}>
                  <TimeAgo date={reactions[-1].created_at} />
                </Show>

                <Show when={props.dateTimeFormat === 'time'}>
                  {formatTime(new Date(reactions[-1].created_at))}
                </Show>

                <Show when={props.dateTimeFormat === 'date'}>
                  {formatDate(new Date(reactions[-1].created_at), { month: 'numeric', year: '2-digit' })}
                </Show>
              </div>
            </div>
          </>
        )}
      </For>
    </>
  )
}
