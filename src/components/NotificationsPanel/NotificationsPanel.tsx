import { clsx } from 'clsx'
import styles from './NotificationsPanel.module.scss'
import { useEscKeyDownHandler } from '../../utils/useEscKeyDownHandler'
import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'
import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'
import { createEffect, For, onCleanup, onMount } from 'solid-js'
import { useNotifications } from '../../context/notifications'
import { NotificationView } from './NotificationView'
import { EmptyMessage } from './EmptyMessage'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsPanel = (props: Props) => {
  const { t } = useLocalize()
  const { sortedNotifications } = useNotifications()
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
        <For each={sortedNotifications()} fallback={<EmptyMessage />}>
          {(notification) => (
            <NotificationView
              notification={notification}
              class={styles.notificationView}
              onClick={handleNotificationViewClick}
            />
          )}
        </For>
      </div>
    </div>
  )
}
