import type { ArticlePageSearchParams } from '../../Article/FullArticle'

import { getPagePath, openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createMemo, createSignal, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useNotifications } from '../../../context/notifications'
import { apiClient } from '../../../graphql/client/core'
import { Reaction, Shout } from '../../../graphql/schema/core.gen'
import { Notification } from '../../../graphql/schema/notifier.gen'
import { router, useRouter } from '../../../stores/router'
import { GroupAvatar } from '../../_shared/GroupAvatar'
import { TimeAgo } from '../../_shared/TimeAgo'

import styles from './NotificationView.module.scss'

type Props = {
  notification: Notification
  onClick: () => void
  dateTimeFormat: 'ago' | 'time' | 'date'
  class?: string
}

export const NotificationView = (props: Props) => {
  const {
    actions: { markNotificationAsRead, hideNotificationsPanel },
  } = useNotifications()

  const { changeSearchParam } = useRouter<ArticlePageSearchParams>()

  const { t, formatDate, formatTime } = useLocalize()

  const [data, setData] = createSignal<Reaction>(null) // NOTE: supports only SSMessage.entity == "reaction"

  onMount(() => {
    setTimeout(() => setData(JSON.parse(props.notification.payload)))
  })

  const lastUser = createMemo(() => data().created_by)

  const handleLinkClick = (event: MouseEvent) => {
    event.stopPropagation()
    hideNotificationsPanel()
  }

  const content = createMemo(() => {
    if (!data()) {
      return null
    }

    let shoutTitle = ''
    let i = 0
    const shoutTitleWords = data().shout.title.split(' ')

    while (shoutTitle.length <= 30 && i < shoutTitleWords.length) {
      shoutTitle += shoutTitleWords[i] + ' '
      i++
    }

    if (shoutTitle.length < data().shout.title.length) {
      shoutTitle = `${shoutTitle.trim()}...`

      if (shoutTitle[0] === '«') {
        shoutTitle += '»'
      }
    }

    switch (props.notification.action) {
      case 'create': {
        if (data()?.reply_to) {
          return (
            <>
              {t('NotificationNewReplyText1', {
                commentsCount: 0, // FIXME: props.notification.occurrences,
              })}{' '}
              <a
                href={getPagePath(router, 'article', { slug: data().shout.slug })}
                onClick={handleLinkClick}
              >
                {shoutTitle}
              </a>{' '}
              {t('NotificationNewReplyText2')}{' '}
              <a href={getPagePath(router, 'author', { slug: lastUser().slug })} onClick={handleLinkClick}>
                {lastUser().name}
              </a>{' '}
              {t('NotificationNewReplyText3', {
                restUsersCount: 0, // FIXME: data().users.length - 1,
              })}
            </>
          )
        } else {
          return (
            <>
              {t('NotificationNewCommentText1', {
                commentsCount: 0, // FIXME: props.notification.occurrences,
              })}{' '}
              <a
                href={getPagePath(router, 'article', { slug: data().shout.slug })}
                onClick={handleLinkClick}
              >
                {shoutTitle}
              </a>{' '}
              {t('NotificationNewCommentText2')}{' '}
              <a href={getPagePath(router, 'author', { slug: lastUser().slug })} onClick={handleLinkClick}>
                {lastUser().name}
              </a>{' '}
              {t('NotificationNewCommentText3', {
                restUsersCount: 0, // FIXME: data().users.length - 1,
              })}
            </>
          )
        }
      }
      case 'update':

      case 'delete':

      case 'follow':

      case 'unfollow':

      case 'invited':
      // TODO: invited for collaborative authoring

      default: {
        return <></>
      }
    }
  })

  const handleClick = () => {
    props.onClick()

    if (!props.notification.seen) {
      markNotificationAsRead(props.notification)
    }

    openPage(router, 'article', { slug: data().shout.slug })
    // FIXME:
    // if (data().reactionIds) {
    //  changeSearchParam({ commentId: data().reactionIds[0].toString() })
    // }
  }

  const formattedDateTime = createMemo(() => {
    switch (props.dateTimeFormat) {
      case 'ago': {
        return <TimeAgo date={props.notification.created_at} />
      }
      case 'time': {
        return formatTime(new Date(props.notification.created_at))
      }
      case 'date': {
        return formatDate(new Date(props.notification.created_at), { month: 'numeric', year: '2-digit' })
      }
    }
  })

  return (
    <Show when={data()}>
      <div
        class={clsx(styles.NotificationView, props.class, {
          [styles.seen]: props.notification.seen,
        })}
        onClick={handleClick}
      >
        <div class={styles.userpic}>
          <GroupAvatar authors={[] /*d FIXME: data().users */} />
        </div>
        <div>{content()}</div>
        <div class={styles.timeContainer}>{formattedDateTime()}</div>
      </div>
    </Show>
  )
}
