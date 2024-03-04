import { getPagePath, openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useNotifications } from '../../../context/notifications'
import { NotificationGroup as Group } from '../../../graphql/schema/core.gen'
import { router, useRouter } from '../../../stores/router'
import { ArticlePageSearchParams } from '../../Article/FullArticle'
import { GroupAvatar } from '../../_shared/GroupAvatar'
import { TimeAgo } from '../../_shared/TimeAgo'

import styles from './NotificationView.module.scss'

type NotificationGroupProps = {
  notifications: Group[]
  onClick: () => void
  dateTimeFormat: 'ago' | 'time' | 'date'
  class?: string
}

const getTitle = (title: string) => {
  let shoutTitle = ''
  let i = 0
  const shoutTitleWords = title.split(' ')

  while (shoutTitle.length <= 30 && i < shoutTitleWords.length) {
    shoutTitle += `${shoutTitleWords[i]} `
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

const threadCaption = (threadId: string) =>
  threadId.includes(':') ? 'Some new replies to your comment' : 'Some new comments to your publication'

export const NotificationGroup = (props: NotificationGroupProps) => {
  const { t, formatTime, formatDate } = useLocalize()
  const { changeSearchParams } = useRouter<ArticlePageSearchParams>()
  const { hideNotificationsPanel, markSeenThread } = useNotifications()
  const handleClick = (threadId: string) => {
    props.onClick()

    markSeenThread(threadId)
    const [slug, commentId] = threadId.split('::')
    openPage(router, 'article', { slug })
    if (commentId) changeSearchParams({ commentId })
  }

  const handleLinkClick = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation()
    hideNotificationsPanel()
  }

  return (
    <>
      <For each={props.notifications}>
        {(n: Group, index) => (
          <>
            {t(threadCaption(n.thread), { commentsCount: n.reactions.length })}{' '}
            <div
              class={clsx(styles.NotificationView, props.class, { [styles.seen]: n.seen })}
              onClick={(_) => handleClick(n.thread)}
            >
              <div class={styles.userpic}>
                <GroupAvatar authors={n.authors} />
              </div>
              <div>
                <a href={getPagePath(router, 'article', { slug: n.shout.slug })} onClick={handleLinkClick}>
                  {getTitle(n.shout.title)}
                </a>{' '}
                {t('from')}{' '}
                <a
                  href={getPagePath(router, 'author', { slug: n.authors[0].slug })}
                  onClick={handleLinkClick}
                >
                  {n.authors[0].name}
                </a>{' '}
              </div>

              <div class={styles.timeContainer}>
                <Show when={props.dateTimeFormat === 'ago'}>
                  <TimeAgo date={n.updated_at} />
                </Show>

                <Show when={props.dateTimeFormat === 'time'}>{formatTime(new Date(n.updated_at))}</Show>

                <Show when={props.dateTimeFormat === 'date'}>
                  {formatDate(new Date(n.updated_at), { month: 'numeric', year: '2-digit' })}
                </Show>
              </div>
            </div>
          </>
        )}
      </For>
    </>
  )
}
