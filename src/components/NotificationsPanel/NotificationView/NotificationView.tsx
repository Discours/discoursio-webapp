import { clsx } from 'clsx'
import styles from './NotificationView.module.scss'
import type { Author, Notification } from '../../../graphql/types.gen'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { NotificationType } from '../../../graphql/types.gen'
import { getPagePath, openPage } from '@nanostores/router'
import { router, useRouter } from '../../../stores/router'
import { useNotifications } from '../../../context/notifications'
import { useLocalize } from '../../../context/localize'
import type { ArticlePageSearchParams } from '../../Article/FullArticle'
import { GroupAvatar } from '../../_shared/GroupAvatar'

type Props = {
  notification: Notification
  onClick: () => void
  class?: string
}

type NotificationData = {
  shout: {
    slug: string
    title: string
  }
  users: {
    id: number
    name: string
    slug: string
    userpic: string
  }[]
  reactionIds: number[]
}

export const NotificationView = (props: Props) => {
  const {
    actions: { markNotificationAsRead, hideNotificationsPanel }
  } = useNotifications()

  const { changeSearchParam } = useRouter<ArticlePageSearchParams>()

  const { t } = useLocalize()

  const [data, setData] = createSignal<NotificationData>(null)

  onMount(() => {
    setTimeout(() => setData(JSON.parse(props.notification.data)))
  })

  const lastUser = createMemo(() => {
    if (!data()) {
      return null
    }

    return data().users[data().users.length - 1]
  })

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

    switch (props.notification.type) {
      case NotificationType.NewComment: {
        return (
          <>
            {t('NotificationNewCommentText1', {
              commentsCount: props.notification.occurrences
            })}{' '}
            <a href={getPagePath(router, 'article', { slug: data().shout.slug })} onClick={handleLinkClick}>
              {shoutTitle}
            </a>{' '}
            {t('NotificationNewCommentText2')}{' '}
            <a href={getPagePath(router, 'author', { slug: lastUser().slug })} onClick={handleLinkClick}>
              {lastUser().name}
            </a>{' '}
            {t('NotificationNewCommentText3', {
              restUsersCount: data().users.length - 1
            })}
          </>
        )
      }
      case NotificationType.NewReply: {
        return (
          <>
            {t('NotificationNewReplyText1', {
              commentsCount: props.notification.occurrences
            })}{' '}
            <a href={getPagePath(router, 'article', { slug: data().shout.slug })} onClick={handleLinkClick}>
              {shoutTitle}
            </a>{' '}
            {t('NotificationNewReplyText2')}{' '}
            <a href={getPagePath(router, 'author', { slug: lastUser().slug })} onClick={handleLinkClick}>
              {lastUser().name}
            </a>{' '}
            {t('NotificationNewReplyText3', {
              restUsersCount: data().users.length - 1
            })}
          </>
        )
      }
    }
  })

  const handleClick = () => {
    props.onClick()

    if (!props.notification.seen) {
      markNotificationAsRead(props.notification)
    }

    openPage(router, 'article', { slug: data().shout.slug })

    if (data().reactionIds) {
      changeSearchParam({ commentId: data().reactionIds[0].toString() })
    }
  }

  return (
    <Show when={data()}>
      <div
        class={clsx(styles.NotificationView, props.class, {
          [styles.seen]: props.notification.seen
        })}
        onClick={handleClick}
      >
        <div class={styles.userpic}>
          <GroupAvatar authors={data().users as Author[]} />
        </div>
        <div>{content()}</div>
        <div class={styles.timeContainer}>
          {/*{formatDate(new Date(props.notification.createdAt), { month: 'numeric' })}*/}
        </div>
      </div>
    </Show>
  )
}
