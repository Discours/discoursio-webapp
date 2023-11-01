import { clsx } from 'clsx'
import styles from './NotificationsPanel.module.scss'
import { useEscKeyDownHandler } from '../../utils/useEscKeyDownHandler'
import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'
import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'
import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js'
import { PAGE_SIZE, useNotifications } from '../../context/notifications'
import { NotificationView } from './NotificationView'
import { EmptyMessage } from './EmptyMessage'
import { Button } from '../_shared/Button'
import throttle from 'just-throttle'
import { useSession } from '../../context/session'

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
  const [isLoading, setIsLoading] = createSignal(false)

  const { isAuthenticated } = useSession()
  const { t } = useLocalize()
  const {
    sortedNotifications,
    unreadNotificationsCount,
    loadedNotificationsCount,
    totalNotificationsCount,
    actions: { loadNotifications, markAllNotificationsAsRead }
  } = useNotifications()
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

  const scrollContainerRef: { current: HTMLDivElement } = { current: null }
  const loadNextPage = async () => {
    await loadNotifications({ limit: PAGE_SIZE, offset: loadedNotificationsCount() })
    if (loadedNotificationsCount() < totalNotificationsCount()) {
      const hasMore = scrollContainerRef.current.scrollHeight <= scrollContainerRef.current.offsetHeight

      if (hasMore) {
        await loadNextPage()
      }
    }
  }
  const handleScroll = async () => {
    if (!scrollContainerRef.current || isLoading()) {
      return
    }
    if (totalNotificationsCount() === loadedNotificationsCount()) {
      return
    }

    const isNearBottom =
      scrollContainerRef.current.scrollHeight - scrollContainerRef.current.scrollTop <=
      scrollContainerRef.current.clientHeight * 1.5

    if (isNearBottom) {
      setIsLoading(true)
      await loadNextPage()
      setIsLoading(false)
    }
  }
  const handleScrollThrottled = throttle(handleScroll, 50)

  onMount(() => {
    scrollContainerRef.current.addEventListener('scroll', handleScrollThrottled)
    onCleanup(() => {
      scrollContainerRef.current.removeEventListener('scroll', handleScrollThrottled)
    })
  })

  createEffect(
    on(
      () => isAuthenticated(),
      async () => {
        if (isAuthenticated()) {
          setIsLoading(true)
          await loadNextPage()
          setIsLoading(false)
        }
      }
    )
  )

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
        <div class={clsx('wide-container', styles.content)} ref={(el) => (scrollContainerRef.current = el)}>
          <Show
            when={sortedNotifications().length > 0}
            fallback={
              <Show when={!isLoading()}>
                <EmptyMessage />
              </Show>
            }
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
          </Show>
          <Show when={isLoading()}>
            <div class={styles.loading}>{t('Loading')}</div>
          </Show>
        </div>

        <Show when={unreadNotificationsCount() > 0}>
          <div class={styles.actions}>
            <Button
              onClick={() => markAllNotificationsAsRead()}
              variant="secondary"
              value={t('Mark as read')}
            />
          </div>
        </Show>
      </div>
    </div>
  )
}
