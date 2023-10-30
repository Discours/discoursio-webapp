import { clsx } from 'clsx'
import styles from './NotificationsPanel.module.scss'
import { useEscKeyDownHandler } from '../../utils/useEscKeyDownHandler'
import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'
import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'
import { createEffect, createMemo, For, Show } from 'solid-js'
import { useNotifications } from '../../context/notifications'
import { NotificationView } from './NotificationView'
import { EmptyMessage } from './EmptyMessage'
import { Button } from '../_shared/Button'
import { InfiniteScroll } from '../_shared/InfiniteScroll'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const getYesterdayStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0)
}

const isSameDate = (date1: Date, date2: Date) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear()

const isToday = (date: Date) => {
  return isSameDate(date, new Date())
}

const isYesterday = (date: Date) => {
  const yesterday = getYesterdayStart()
  return isSameDate(date, yesterday)
}

const isEarlier = (date: Date) => {
  const yesterday = getYesterdayStart()
  return date.getTime() < yesterday.getTime()
}

export const NotificationsPanel = (props: Props) => {
  const { t } = useLocalize()
  const { sortedNotifications, unreadNotificationsCount, actions } = useNotifications()

  const handleHide = () => {
    props.onClose()
  }

  const panelRef: { current: HTMLDivElement } = {
    current: null
  }

  useOutsideClickHandler({
    containerRef: panelRef,
    predicate: () => props.isOpen,
    handler: () => handleHide()
  })

  let windowScrollTop = 0

  createEffect(() => {
    const mainContent = document.querySelector<HTMLDivElement>('.main-content')

    if (props.isOpen) {
      windowScrollTop = window.scrollY
      mainContent.style.marginTop = `-${windowScrollTop}px`
    }

    document.body.classList.toggle('fixed', props.isOpen)

    if (!props.isOpen) {
      mainContent.style.marginTop = ''
      window.scrollTo(0, windowScrollTop)
    }
  })

  useEscKeyDownHandler(handleHide)

  const handleNotificationViewClick = () => {
    handleHide()
  }

  const todayNotifications = createMemo(() => {
    return sortedNotifications().filter((notification) => isToday(new Date(notification.createdAt)))
  })

  const yesterdayNotifications = createMemo(() => {
    return sortedNotifications().filter((notification) => isYesterday(new Date(notification.createdAt)))
  })

  const earlierNotifications = createMemo(() => {
    return sortedNotifications().filter((notification) => isEarlier(new Date(notification.createdAt)))
  })

  return (
    <div
      class={clsx(styles.container, {
        [styles.isOpened]: props.isOpen
      })}
    >
      <div ref={(el) => (panelRef.current = el)} class={styles.panel}>
        <div class={styles.closeButton} onClick={handleHide}>
          {/*TODO: check markup (hover)*/}
          <Icon name="close" />
        </div>
        <div class={styles.title}>{t('Notifications')}</div>
        <Show when={sortedNotifications().length > 0} fallback={<EmptyMessage />}>
          <InfiniteScroll
            pageSize={10}
            class={clsx('wide-container', styles.content)}
            callbackOnEnd={() => {
              console.log('!!! SCROLL:')
            }}
          >
            <div class="row position-relative">
              <div class="col-xs-24">
                <Show when={todayNotifications().length > 0}>
                  <div class={styles.periodTitle}>{t('today')}</div>
                  <For each={todayNotifications()}>
                    {(notification) => (
                      <NotificationView
                        notification={notification}
                        class={styles.notificationView}
                        onClick={handleNotificationViewClick}
                        dateTimeFormat={'ago'}
                      />
                    )}
                  </For>
                </Show>
                <Show when={yesterdayNotifications().length > 0}>
                  <div class={styles.periodTitle}>{t('yesterday')}</div>
                  <For each={yesterdayNotifications()}>
                    {(notification) => (
                      <NotificationView
                        notification={notification}
                        class={styles.notificationView}
                        onClick={handleNotificationViewClick}
                        dateTimeFormat={'time'}
                      />
                    )}
                  </For>
                </Show>
                <Show when={earlierNotifications().length > 0}>
                  <div class={styles.periodTitle}>{t('earlier')}</div>
                  <For each={earlierNotifications()}>
                    {(notification) => (
                      <NotificationView
                        notification={notification}
                        class={styles.notificationView}
                        onClick={handleNotificationViewClick}
                        dateTimeFormat={'date'}
                      />
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </InfiniteScroll>

          <Show when={unreadNotificationsCount() > 0}>
            <div class={styles.actions}>
              <Button
                onClick={() => actions.markAllNotificationsAsRead()}
                variant="secondary"
                value={t('Mark as read')}
              />
            </div>
          </Show>
        </Show>
      </div>
    </div>
  )
}
