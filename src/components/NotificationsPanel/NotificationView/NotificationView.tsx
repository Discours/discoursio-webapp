import { clsx } from 'clsx'
import styles from './NotificationView.module.scss'
import type { Notification } from '../../../graphql/types.gen'
import { formatDate } from '../../../utils'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { NotificationType } from '../../../graphql/types.gen'
import { getPagePath, openPage } from '@nanostores/router'
import { router, useRouter } from '../../../stores/router'
import { useNotifications } from '../../../context/notifications'
import { Userpic } from '../../Author/Userpic'
import { useLocalize } from '../../../context/localize'
import notifications from '../../../graphql/query/notifications'
import { ArticlePageSearchParams } from '../../Article/FullArticle'

type Props = {
  notification: Notification
  onClick: () => void
  class?: string
}

const stopPropagation = (event: MouseEvent) => {
  event.stopPropagation()
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
        <Userpic name={lastUser().name} userpic={lastUser().userpic} class={styles.userpic} />
        <div>{content()}</div>
        <div class={styles.timeContainer}>
          {/*{formatDate(new Date(props.notification.createdAt), { month: 'numeric' })}*/}
        </div>
      </div>
    </Show>
  )
}
