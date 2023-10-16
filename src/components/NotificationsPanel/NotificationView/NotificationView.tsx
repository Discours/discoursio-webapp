import { clsx } from 'clsx'
import styles from './NotificationView.module.scss'
import type { Notification } from '../../../graphql/types.gen'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { NotificationType } from '../../../graphql/types.gen'
import { openPage } from '@nanostores/router'
import { router } from '../../../stores/router'
import { useNotifications } from '../../../context/notifications'
import { Userpic } from '../../Author/Userpic'
import { useLocalize } from '../../../context/localize'

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
}

export const NotificationView = (props: Props) => {
  const {
    actions: { markNotificationAsRead }
  } = useNotifications()

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
      shoutTitle += '...'
    }

    switch (props.notification.type) {
      case NotificationType.NewComment: {
        return t('NewCommentNotificationText', {
          commentsCount: props.notification.occurrences,
          shoutTitle,
          lastCommenterName: lastUser().name,
          restUsersCount: data().users.length - 1
        })
      }
      case NotificationType.NewReply: {
        return t('NewReplyNotificationText', {
          commentsCount: props.notification.occurrences,
          shoutTitle,
          lastCommenterName: lastUser().name,
          restUsersCount: data().users.length - 1
        })
      }
    }
  })

  const handleClick = () => {
    if (!props.notification.seen) {
      markNotificationAsRead(props.notification)
    }

    openPage(router, 'article', { slug: data().shout.slug })
    props.onClick()

    // switch (props.notification.type) {
    //   case NotificationType.NewComment: {
    //     openPage(router, 'article', { slug: data().shout.slug })
    //     break
    //   }
    //   case NotificationType.NewReply: {
    //     openPage(router, 'article', { slug: data().shout.slug })
    //     break
    //   }
    // }
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
